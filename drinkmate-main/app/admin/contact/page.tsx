"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Building,
  Phone,
  Eye,
  Reply,
  Trash2
} from "lucide-react"
import { contactAPI } from "@/lib/api"
import { toast } from "sonner"

interface ContactMessage {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  response?: {
    text: string
    sentAt: string
    sentBy: string
  }
  notes: Array<{
    text: string
    createdBy: string
    createdAt: string
  }>
  createdAt: string
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAddingResponse, setIsAddingResponse] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState<{status: 'new' | 'in_progress' | 'resolved' | 'closed', priority: 'low' | 'medium' | 'high' | 'urgent'}>({status: 'new', priority: 'low'})
  const [responseText, setResponseText] = useState("")

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await contactAPI.getAllContacts({ limit: 100 })
      if (response.success) {
        setContacts(response.contacts || [])
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error("Failed to fetch contact messages")
    } finally {
      setLoading(false)
    }
  }

  const handleViewContact = (contact: ContactMessage) => {
    setSelectedContact(contact)
    setStatusUpdate({ status: contact.status, priority: contact.priority })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return

    try {
      await contactAPI.deleteContact(id)
      toast.success("Contact message deleted successfully")
      fetchContacts()
    } catch (error: any) {
      console.error("Error deleting contact:", error)
      toast.error(error.response?.data?.message || "Failed to delete contact message")
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedContact) return

    try {
      setIsUpdatingStatus(true)
      await contactAPI.updateContactStatus(selectedContact._id, statusUpdate)
      toast.success("Contact status updated successfully")
      fetchContacts()
      // Update the selected contact with new status
      setSelectedContact({ ...selectedContact, ...statusUpdate })
    } catch (error: any) {
      console.error("Error updating contact status:", error)
      toast.error(error.response?.data?.message || "Failed to update contact status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddResponse = async () => {
    if (!selectedContact || !responseText.trim()) return

    try {
      setIsAddingResponse(true)
      await contactAPI.addContactResponse(selectedContact._id, {
        text: responseText,
        sentBy: "Admin" // This should come from the current user context
      })
      toast.success("Response added successfully")
      setResponseText("")
      fetchContacts()
    } catch (error: any) {
      console.error("Error adding response:", error)
      toast.error(error.response?.data?.message || "Failed to add response")
    } finally {
      setIsAddingResponse(false)
    }
  }

  const handleViewDetails = (contact: ContactMessage) => {
    setSelectedContact(contact)
    setStatusUpdate({ status: contact.status, priority: contact.priority })
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default'
      case 'in_progress': return 'secondary'
      case 'resolved': return 'outline'
      case 'closed': return 'destructive'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'outline'
      case 'medium': return 'secondary'
      case 'high': return 'default'
      case 'urgent': return 'destructive'
      default: return 'secondary'
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || contact.priority === selectedPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contact messages...</div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
            <p className="text-muted-foreground">
              View and manage customer contact messages
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{contacts.length}</div>
              </div>
              <p className="text-xs text-muted-foreground">Total Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="text-2xl font-bold">
                  {contacts.filter(c => c.status === 'new').length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div className="text-2xl font-bold">
                  {contacts.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold">
                  {contacts.filter(c => c.status === 'resolved').length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Messages ({filteredContacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No contact messages found</p>
                <p className="text-sm text-gray-400">Messages will appear here when customers contact you</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                          {contact.phone && (
                            <div className="text-sm text-gray-500">{contact.phone}</div>
                          )}
                          {contact.company && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {contact.company}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{contact.subject}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{contact.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          contact.status === 'new' ? 'default' :
                          contact.status === 'in_progress' ? 'secondary' :
                          contact.status === 'resolved' ? 'outline' :
                          'secondary'
                        }>
                          {contact.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          contact.priority === 'urgent' ? 'destructive' :
                          contact.priority === 'high' ? 'default' :
                          contact.priority === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewContact(contact)}
                            className="h-8 px-3"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(contact._id)}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{selectedContact.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedContact.email}</p>
                    </div>
                    {selectedContact.phone && (
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{selectedContact.phone}</p>
                      </div>
                    )}
                    {selectedContact.company && (
                      <div>
                        <Label className="text-sm font-medium">Company</Label>
                        <p className="text-sm">{selectedContact.company}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subject</Label>
                    <p className="text-sm font-medium">{selectedContact.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Message</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Received: {new Date(selectedContact.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={statusUpdate.status} 
                        onValueChange={(value: 'new' | 'in_progress' | 'resolved' | 'closed') => 
                          setStatusUpdate(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={statusUpdate.priority} 
                        onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                          setStatusUpdate(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateStatus}
                    disabled={isUpdatingStatus}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                  >
                    {isUpdatingStatus ? "Updating..." : "Update Status"}
                  </Button>
                </CardContent>
              </Card>

              {/* Response Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="response">Response Message</Label>
                    <Textarea
                      id="response"
                      placeholder="Type your response to the customer..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleAddResponse}
                    disabled={isAddingResponse || !responseText.trim()}
                    className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                  >
                    {isAddingResponse ? "Sending..." : "Send Response"}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Response */}
              {selectedContact.response && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{selectedContact.response.text}</p>
                      <div className="text-xs text-gray-500">
                        Sent by {selectedContact.response.sentBy} on {new Date(selectedContact.response.sentAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedContact.notes && selectedContact.notes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedContact.notes.map((note, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-3">
                          <p className="text-sm">{note.text}</p>
                          <div className="text-xs text-gray-500">
                            Added by {note.createdBy} on {new Date(note.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
