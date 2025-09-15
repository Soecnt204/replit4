import jsPDF from "jspdf"

export class PDFGenerator {
  static generateReceipt(receipt: any): void {
    const doc = new jsPDF()

    // Header with enhanced branding
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 102, 204) // Blue color
    doc.text("HZ Shop", 105, 25, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("Your Trusted Shopping Partner", 105, 32, { align: "center" })

    // Reset color
    doc.setTextColor(0, 0, 0)

    // Receipt box
    doc.setDrawColor(0, 102, 204)
    doc.setLineWidth(0.5)
    doc.rect(15, 10, 180, 25)

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("SALES RECEIPT", 105, 50, { align: "center" })

    // Receipt details in a structured format
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    // Left column
    doc.text(`Receipt #: ${receipt.receiptNumber || receipt.id}`, 20, 65)
    doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, 20, 75)
    doc.text(`Time: ${new Date(receipt.date).toLocaleTimeString()}`, 20, 85)

    // Right column
    doc.text(`Customer: ${receipt.customerName}`, 110, 65)
    doc.text(`Phone: ${receipt.customerPhone}`, 110, 75)
    doc.text(`Cashier: ${receipt.createdBy || "Admin"}`, 110, 85)

    // Items table header
    let yPos = 105
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPos - 5, 190, yPos - 5)

    doc.setFont("helvetica", "bold")
    doc.text("Item Description", 20, yPos)
    doc.text("Qty", 120, yPos)
    doc.text("Rate", 140, yPos)
    doc.text("Amount", 165, yPos)

    yPos += 5
    doc.line(20, yPos, 190, yPos)
    yPos += 10

    doc.setFont("helvetica", "normal")

    // Items
    receipt.items.forEach((item: any) => {
      if (yPos > 250) {
        // New page if needed
        doc.addPage()
        yPos = 30
      }

      doc.text(item.productName.substring(0, 35), 20, yPos)
      doc.text(item.quantity.toString(), 125, yPos, { align: "center" })
      doc.text(`PKR ${item.price.toLocaleString()}`, 145, yPos, { align: "center" })
      doc.text(`PKR ${item.total.toLocaleString()}`, 175, yPos, { align: "right" })
      yPos += 8
    })

    // Return items if any
    if (receipt.returnItems && receipt.returnItems.length > 0) {
      yPos += 5
      doc.line(20, yPos, 190, yPos)
      yPos += 10

      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 102, 0) // Orange for returns
      doc.text("RETURNS:", 20, yPos)
      yPos += 8

      doc.setFont("helvetica", "normal")
      receipt.returnItems.forEach((item: any) => {
        doc.text(`- ${item.productName.substring(0, 30)}`, 20, yPos)
        doc.text(item.quantity.toString(), 125, yPos, { align: "center" })
        doc.text(`PKR ${(item.amount / item.quantity).toLocaleString()}`, 145, yPos, { align: "center" })
        doc.text(`-PKR ${item.amount.toLocaleString()}`, 175, yPos, { align: "right" })
        yPos += 8
      })
      doc.setTextColor(0, 0, 0) // Reset color
    }

    // Totals section
    yPos += 10
    doc.setLineWidth(1)
    doc.line(110, yPos, 190, yPos)
    yPos += 10

    doc.setFont("helvetica", "normal")
    doc.text(`Subtotal:`, 120, yPos)
    doc.text(`PKR ${receipt.subtotal.toLocaleString()}`, 175, yPos, { align: "right" })
    yPos += 8

    if (receipt.discount > 0) {
      doc.text(`Discount:`, 120, yPos)
      doc.text(`-PKR ${receipt.discount.toLocaleString()}`, 175, yPos, { align: "right" })
      yPos += 8
    }

    if (receipt.returnTotal > 0) {
      doc.setTextColor(255, 102, 0)
      doc.text(`Returns:`, 120, yPos)
      doc.text(`-PKR ${receipt.returnTotal.toLocaleString()}`, 175, yPos, { align: "right" })
      doc.setTextColor(0, 0, 0)
      yPos += 8
    }

    // Final total
    doc.setLineWidth(0.5)
    doc.line(110, yPos, 190, yPos)
    yPos += 8

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`TOTAL:`, 120, yPos)
    doc.text(`PKR ${receipt.total.toLocaleString()}`, 175, yPos, { align: "right" })
    yPos += 10

    doc.setFontSize(10)
    doc.text(`Amount Received:`, 120, yPos)
    doc.text(`PKR ${(receipt.receivedAmount || receipt.amountReceived || 0).toLocaleString()}`, 175, yPos, {
      align: "right",
    })

    const pendingAmount = receipt.total - (receipt.receivedAmount || receipt.amountReceived || 0)
    if (pendingAmount > 0) {
      yPos += 8
      doc.setTextColor(255, 0, 0)
      doc.text(`Pending:`, 120, yPos)
      doc.text(`PKR ${pendingAmount.toLocaleString()}`, 175, yPos, { align: "right" })
      doc.setTextColor(0, 0, 0)
    } else if (pendingAmount < 0) {
      yPos += 8
      doc.setTextColor(0, 150, 0)
      doc.text(`Change:`, 120, yPos)
      doc.text(`PKR ${Math.abs(pendingAmount).toLocaleString()}`, 175, yPos, { align: "right" })
      doc.setTextColor(0, 0, 0)
    }

    // Notes if any
    if (receipt.notes) {
      yPos += 15
      doc.setFont("helvetica", "italic")
      doc.setFontSize(9)
      doc.text(`Notes: ${receipt.notes}`, 20, yPos)
    }

    // Footer
    yPos += 25
    doc.setDrawColor(0, 102, 204)
    doc.line(20, yPos, 190, yPos)
    yPos += 10

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Thank you for shopping with us!", 105, yPos, { align: "center" })
    yPos += 8
    doc.text("Visit us again soon!", 105, yPos, { align: "center" })

    // Download the PDF
    doc.save(`Receipt-${receipt.receiptNumber || receipt.id}.pdf`)
  }
}
