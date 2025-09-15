// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = "HZShopDB"
  private version = 4 // Incremented version for schema update
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        const stores = [
          "products",
          "categories",
          "shopkeepers",
          "receipts",
          "receipt_items",
          "returns",
          "return_items",
          "reports",
          "settings",
          "sync_queue",
          "payment_history",
          "stock_movements",
        ]

        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" })
            store.createIndex("updated_at", "updated_at", { unique: false })
            store.createIndex("synced", "synced", { unique: false })
          }
        })
      }
    })
  }

  async save<T extends { id: string }>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)

    const dataWithMeta = {
      ...data,
      updated_at: new Date().toISOString(),
      synced: false,
    }

    await store.put(dataWithMeta)

    // Add to sync queue
    await this.addToSyncQueue(storeName, "upsert", dataWithMeta)
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction([storeName], "readonly")
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction([storeName], "readonly")
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)

    await store.delete(id)
    await this.addToSyncQueue(storeName, "delete", { id })
  }

  private async addToSyncQueue(storeName: string, operation: string, data: any): Promise<void> {
    const transaction = this.db!.transaction(["sync_queue"], "readwrite")
    const store = transaction.objectStore("sync_queue")

    const syncItem = {
      id: `${storeName}_${operation}_${data.id}_${Date.now()}`,
      storeName,
      operation,
      data,
      created_at: new Date().toISOString(),
      synced: false,
    }

    await store.put(syncItem)
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(["sync_queue"], "readonly")
    const store = transaction.objectStore("sync_queue")
    const index = store.index("synced")

    return new Promise((resolve, reject) => {
      const results: any[] = []
      const request = index.openCursor()

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          // Only include items where synced is false
          if (cursor.value.synced === false) {
            results.push(cursor.value)
          }
          cursor.continue()
        } else {
          // No more entries
          resolve(results)
        }
      }
    })
  }

  async markSynced(syncId: string): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(["sync_queue"], "readwrite")
    const store = transaction.objectStore("sync_queue")

    return new Promise((resolve, reject) => {
      const request = store.get(syncId)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const item = request.result
        if (item) {
          item.synced = true
          const putRequest = store.put(item)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          resolve()
        }
      }
    })
  }
}

export const offlineStorage = new OfflineStorage()
