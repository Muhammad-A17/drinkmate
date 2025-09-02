"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  User,
  Package,
  Calendar,
  MessageSquare,
  Bot,
  Bell,
  Settings,
  Upload,
  Zap,
  Target,
  Award,
  Shield,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  Flag,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react"
import type { 
  Review, 
  Product, 
  User as UserType, 
  CreateReviewForm, 
  ResponseTemplate, 
  ModerationSettings,
  ReviewReport 
} from "@/lib/types/review"

interface ReviewDialogsProps {
  // Create Review Dialog
  showCreateReview: boolean
  onCreateReviewClose: () => void
  onCreateReviewSubmit: (formData: CreateReviewForm) => Promise<boolean>
  products: Product[]
  users: UserType[]

  // Review Details Dialog
  showReviewDetails: boolean
  onReviewDetailsClose: () => void
  selectedReview: Review | null

  // Admin Response Dialog
  showAdminResponse: boolean
  onAdminResponseClose: () => void
  onAdminResponseSubmit: (reviewId: string, response: string) => Promise<boolean>
  responseReview: Review | null

  // Response Templates Dialog
  showTemplates: boolean
  onTemplatesClose: () => void
  onTemplateSelect: (template: ResponseTemplate) => void

  // Bulk Import Dialog
  showBulkImport: boolean
  onBulkImportClose: () => void
  onBulkImportSubmit: (file: File) => Promise<void>

  // Moderation Settings Dialog
  showModeration: boolean
  onModerationClose: () => void
  onModerationSubmit: (settings: ModerationSettings) => Promise<void>

  // Workflow Settings Dialog
  showWorkflow: boolean
  onWorkflowClose: () => void

  // Reports Dialog
  showReports: boolean
  onReportsClose: () => void
  onGenerateReport: (type: "daily" | "weekly" | "monthly") => Promise<void>
}

export default function ReviewDialogs({
  showCreateReview,
  onCreateReviewClose,
  onCreateReviewSubmit,
  products,
  users,
  showReviewDetails,
  onReviewDetailsClose,
  selectedReview,
  showAdminResponse,
  onAdminResponseClose,
  onAdminResponseSubmit,
  responseReview,
  showTemplates,
  onTemplatesClose,
  onTemplateSelect,
  showBulkImport,
  onBulkImportClose,
  onBulkImportSubmit,
  showModeration,
  onModerationClose,
  onModerationSubmit,
  showWorkflow,
  onWorkflowClose,
  showReports,
  onReportsClose,
  onGenerateReport
}: ReviewDialogsProps) {
  // Create Review Form State
  const [createReviewForm, setCreateReviewForm] = useState<CreateReviewForm>({
    productId: "",
    userId: "",
    rating: 5,
    title: "",
    comment: "",
    isVerifiedPurchase: false
  })

  // Admin Response State
  const [adminResponse, setAdminResponse] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Moderation Settings State
  const [moderationSettings, setModerationSettings] = useState<ModerationSettings>({
    autoApprove: false,
    autoFlagSpam: true,
    minWordCount: 10,
    maxWordCount: 500,
    enableAI: false
  })

  // Response Templates Data
  const responseTemplates: ResponseTemplate[] = [
    {
      id: "1",
      name: "Thank You - Positive",
      content: "Thank you for your positive feedback! We're delighted to hear about your experience.",
      category: "positive"
    },
    {
      id: "2",
      name: "Apology - Negative",
      content: "We sincerely apologize for the issues you encountered. Please contact our support team for assistance.",
      category: "apology"
    },
    {
      id: "3",
      name: "Clarification",
      content: "Thank you for your review. We'd like to clarify that [specific point] to ensure accuracy.",
      category: "clarification"
    },
    {
      id: "4",
      name: "Follow-up Request",
      content: "Thank you for your feedback. We'd love to hear more about your experience. Please reach out to us.",
      category: "neutral"
    }
  ]

  const handleCreateReviewSubmit = async () => {
    const success = await onCreateReviewSubmit(createReviewForm)
    if (success) {
      setCreateReviewForm({
        productId: "",
        userId: "",
        rating: 5,
        title: "",
        comment: "",
        isVerifiedPurchase: false
      })
      onCreateReviewClose()
    }
  }

  const handleAdminResponseSubmit = async () => {
    if (responseReview && adminResponse.trim()) {
      const success = await onAdminResponseSubmit(responseReview._id, adminResponse)
      if (success) {
        setAdminResponse("")
        setSelectedTemplate("")
        onAdminResponseClose()
      }
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = responseTemplates.find(t => t.id === templateId)
    if (template) {
      setAdminResponse(template.content)
      setSelectedTemplate(templateId)
      onTemplateSelect(template)
    }
  }

  const handleBulkImportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get('file') as File
    if (file) {
      await onBulkImportSubmit(file)
      onBulkImportClose()
    }
  }

  const handleModerationSubmit = async () => {
    await onModerationSubmit(moderationSettings)
    onModerationClose()
  }

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
      />
    ))
  }

  return (
    <>
      {/* Create Review Dialog */}
      <Dialog open={showCreateReview} onOpenChange={onCreateReviewClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={createReviewForm.productId} onValueChange={(value) => setCreateReviewForm({...createReviewForm, productId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="user">User</Label>
                <Select value={createReviewForm.userId} onValueChange={(value) => setCreateReviewForm({...createReviewForm, userId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {renderStars(createReviewForm.rating, true, (rating) => setCreateReviewForm({...createReviewForm, rating}))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={createReviewForm.title}
                onChange={(e) => setCreateReviewForm({...createReviewForm, title: e.target.value})}
                placeholder="Review title"
              />
            </div>
            
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={createReviewForm.comment}
                onChange={(e) => setCreateReviewForm({...createReviewForm, comment: e.target.value})}
                placeholder="Write your review..."
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={createReviewForm.isVerifiedPurchase}
                onCheckedChange={(checked) => setCreateReviewForm({...createReviewForm, isVerifiedPurchase: !!checked})}
              />
              <Label htmlFor="verified">Verified Purchase</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCreateReviewClose}>Cancel</Button>
            <Button onClick={handleCreateReviewSubmit}>Create Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Details Dialog */}
      <Dialog open={showReviewDetails} onOpenChange={onReviewDetailsClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] flex items-center justify-center text-white font-semibold">
                        {selectedReview.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedReview.user.username}</h3>
                        <p className="text-sm text-gray-500">Reviewer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Product Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h3 className="font-semibold">{selectedReview.product?.name || selectedReview.bundle?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedReview.product ? 'Product' : 'Bundle'}
                    </p>
                    {selectedReview.isVerifiedPurchase && (
                      <Badge variant="outline" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Review Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-lg font-medium">{selectedReview.rating}.0</span>
                    <Badge className={
                      selectedReview.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      selectedReview.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                    </Badge>
                    {selectedReview.flagged && (
                      <Badge variant="destructive">
                        <Flag className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  
                  {selectedReview.title && (
                    <h4 className="text-xl font-semibold">{selectedReview.title}</h4>
                  )}
                  
                  <p className="text-gray-700 leading-relaxed">{selectedReview.comment}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </div>
                    {selectedReview.helpfulCount && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {selectedReview.helpfulCount} helpful
                      </div>
                    )}
                    {selectedReview.qualityScore && (
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Quality: {selectedReview.qualityScore}%
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedReview.adminResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Admin Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedReview.adminResponse}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onReviewDetailsClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Response Dialog */}
      <Dialog open={showAdminResponse} onOpenChange={onAdminResponseClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Admin Response</DialogTitle>
          </DialogHeader>
          {responseReview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Responding to:</h4>
                <p className="text-sm text-gray-600">"{responseReview.comment}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium">{responseReview.user.username}</span>
                  <div className="flex">
                    {renderStars(responseReview.rating)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="template">Response Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {responseTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="response">Admin Response</Label>
                <Textarea
                  id="response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Write your response..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onAdminResponseClose}>Cancel</Button>
            <Button onClick={handleAdminResponseSubmit}>Add Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={onTemplatesClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Response Templates</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responseTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <Badge variant="outline">{template.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{template.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onTemplatesClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onOpenChange={onBulkImportClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Reviews</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkImportSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".csv"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV file with review data. Required columns: user_id, product_id, rating, comment
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onBulkImportClose}>Cancel</Button>
              <Button type="submit">Import Reviews</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Moderation Settings Dialog */}
      <Dialog open={showModeration} onOpenChange={onModerationClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderation Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Reviews</Label>
                  <p className="text-sm text-gray-500">Automatically approve reviews that meet criteria</p>
                </div>
                <Checkbox
                  checked={moderationSettings.autoApprove}
                  onCheckedChange={(checked) => setModerationSettings({...moderationSettings, autoApprove: !!checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-flag Spam</Label>
                  <p className="text-sm text-gray-500">Automatically flag potential spam reviews</p>
                </div>
                <Checkbox
                  checked={moderationSettings.autoFlagSpam}
                  onCheckedChange={(checked) => setModerationSettings({...moderationSettings, autoFlagSpam: !!checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Moderation</Label>
                  <p className="text-sm text-gray-500">Use AI to analyze review content</p>
                </div>
                <Checkbox
                  checked={moderationSettings.enableAI}
                  onCheckedChange={(checked) => setModerationSettings({...moderationSettings, enableAI: !!checked})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minWords">Minimum Word Count</Label>
                <Input
                  id="minWords"
                  type="number"
                  value={moderationSettings.minWordCount}
                  onChange={(e) => setModerationSettings({...moderationSettings, minWordCount: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="maxWords">Maximum Word Count</Label>
                <Input
                  id="maxWords"
                  type="number"
                  value={moderationSettings.maxWordCount}
                  onChange={(e) => setModerationSettings({...moderationSettings, maxWordCount: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onModerationClose}>Cancel</Button>
            <Button onClick={handleModerationSubmit}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Settings Dialog */}
      <Dialog open={showWorkflow} onOpenChange={onWorkflowClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Workflow Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="automation" className="space-y-4">
            <TabsList>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Automation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-approve verified purchases</h4>
                      <p className="text-sm text-gray-500">Automatically approve reviews from verified customers</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-flag low ratings</h4>
                      <p className="text-sm text-gray-500">Flag reviews with ratings below 2 stars for manual review</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-respond to negative reviews</h4>
                      <p className="text-sm text-gray-500">Send automatic responses to reviews with ratings below 3 stars</p>
                    </div>
                    <Checkbox />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Quality Assurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Content filtering</h4>
                      <p className="text-sm text-gray-500">Filter out inappropriate content automatically</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Duplicate detection</h4>
                      <p className="text-sm text-gray-500">Detect and flag duplicate reviews</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sentiment analysis</h4>
                      <p className="text-sm text-gray-500">Analyze review sentiment for quality insights</p>
                    </div>
                    <Checkbox />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New review notifications</h4>
                      <p className="text-sm text-gray-500">Get notified when new reviews are submitted</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Flagged review alerts</h4>
                      <p className="text-sm text-gray-500">Get alerts for reviews that need attention</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Daily summary emails</h4>
                      <p className="text-sm text-gray-500">Receive daily summaries of review activity</p>
                    </div>
                    <Checkbox />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={onWorkflowClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReports} onOpenChange={onReportsClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Reports</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onGenerateReport("daily")}>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Daily Report</h3>
                <p className="text-sm text-gray-500">Review activity for today</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onGenerateReport("weekly")}>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">Weekly Report</h3>
                <p className="text-sm text-gray-500">Review trends for this week</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onGenerateReport("monthly")}>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">Monthly Report</h3>
                <p className="text-sm text-gray-500">Comprehensive monthly analysis</p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onReportsClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
