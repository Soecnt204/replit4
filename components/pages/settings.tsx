"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Bell, Palette, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Settings() {
  const [settings, setSettings] = useState({
    // Appearance
    darkMode: false,
    sidebarCollapse: false,
    compactMode: false,
    showOfflineBadge: true,
    language: "en",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",

    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    lowStockAlerts: true,
    salesReports: true,
    systemUpdates: false,

    // Business
    businessName: "ShopManager Store",
    businessAddress: "123 Main Street, City, State 12345",
    businessPhone: "+91 98765 43210",
    businessEmail: "contact@shopmanager.com",
    taxRate: "18",

    // System
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "1_year",
    apiAccess: false,
    debugMode: false,
  })

  const { toast } = useToast()

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "Your data export is being prepared and will be downloaded shortly.",
    })
  }

  const handleImportData = () => {
    toast({
      title: "Import Data",
      description: "Please select a valid backup file to import.",
    })
  }

  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSaveSettings}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(value) => handleSettingChange("darkMode", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Compact Mode</h4>
                  <p className="text-sm text-muted-foreground">Reduce spacing for more content on screen</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(value) => handleSettingChange("compactMode", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sidebar Auto-collapse</h4>
                  <p className="text-sm text-muted-foreground">Automatically collapse sidebar on smaller screens</p>
                </div>
                <Switch
                  checked={settings.sidebarCollapse}
                  onCheckedChange={(value) => handleSettingChange("sidebarCollapse", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Offline Badge</h4>
                  <p className="text-sm text-muted-foreground">Display offline status in the header</p>
                </div>
                <Switch
                  checked={settings.showOfflineBadge}
                  onCheckedChange={(value) => handleSettingChange("showOfflineBadge", value)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => handleSettingChange("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange("emailNotifications", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(value) => handleSettingChange("pushNotifications", value)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Low Stock Alerts</h5>
                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                  </div>
                  <Switch
                    checked={settings.lowStockAlerts}
                    onCheckedChange={(value) => handleSettingChange("lowStockAlerts", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Sales Reports</h5>
                    <p className="text-sm text-muted-foreground">Receive daily and weekly sales summaries</p>
                  </div>
                  <Switch
                    checked={settings.salesReports}
                    onCheckedChange={(value) => handleSettingChange("salesReports", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">System Updates</h5>
                    <p className="text-sm text-muted-foreground">Get notified about app updates and maintenance</p>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(value) => handleSettingChange("systemUpdates", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.businessName}
                    onChange={(e) => handleSettingChange("businessName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={settings.businessPhone}
                    onChange={(e) => handleSettingChange("businessPhone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleSettingChange("businessEmail", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input
                  id="businessAddress"
                  value={settings.businessAddress}
                  onChange={(e) => handleSettingChange("businessAddress", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange("taxRate", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Backup, restore, and manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Automatic Backup</h4>
                  <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(value) => handleSettingChange("autoBackup", value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => handleSettingChange("backupFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention</Label>
                  <Select
                    value={settings.dataRetention}
                    onValueChange={(value) => handleSettingChange("dataRetention", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="1_year">1 Year</SelectItem>
                      <SelectItem value="2_years">2 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Operations</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleExportData}>
                    Export Data
                  </Button>
                  <Button variant="outline" onClick={handleImportData}>
                    Import Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Advanced Settings</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">API Access</h5>
                    <p className="text-sm text-muted-foreground">Enable API access for third-party integrations</p>
                  </div>
                  <Switch
                    checked={settings.apiAccess}
                    onCheckedChange={(value) => handleSettingChange("apiAccess", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Debug Mode</h5>
                    <p className="text-sm text-muted-foreground">Enable debug logging (for troubleshooting)</p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(value) => handleSettingChange("debugMode", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About ShopManager</CardTitle>
              <CardDescription>Application information and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Version Information</h4>
                  <p className="text-sm text-muted-foreground">App Version: 1.0.0</p>
                  <p className="text-sm text-muted-foreground">Build: 2024.01.15</p>
                  <p className="text-sm text-muted-foreground">Last Updated: January 15, 2024</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Support</h4>
                  <p className="text-sm text-muted-foreground">Email: support@shopmanager.com</p>
                  <p className="text-sm text-muted-foreground">Phone: +91 98765 43210</p>
                  <p className="text-sm text-muted-foreground">Website: www.shopmanager.com</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">License</h4>
                <p className="text-sm text-muted-foreground">
                  ShopManager is licensed under the MIT License. This software is provided "as is" without warranty of
                  any kind.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Built with React, Next.js, and Tailwind CSS. Icons provided by Lucide React.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
