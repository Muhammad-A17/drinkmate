Imports ShippingClient.ShippingReference

Public Class frmCancelPickupCallResponse

#Region "Members"
    Private _Response As PickupCancelationResponse = Nothing
#End Region

#Region "Properties"
    Public WriteOnly Property Response As PickupCancelationResponse
        Set(ByVal value As PickupCancelationResponse)
            _Response = value
        End Set
    End Property
#End Region

#Region "Methods"
    Private Sub frmCancelPickupCallResponse_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        If (_Response Is Nothing) Then Return

        Dim _TransactionNode As New TreeNode("Transaction")
        If (_Response.Transaction IsNot Nothing) Then
            _TransactionNode.Nodes.Add("Reference1 = '" + IIf(String.IsNullOrEmpty(_Response.Transaction.Reference1), String.Empty, _Response.Transaction.Reference1) + "'")
            _TransactionNode.Nodes.Add("Reference2 = '" + IIf(String.IsNullOrEmpty(_Response.Transaction.Reference2), String.Empty, _Response.Transaction.Reference2) + "'")
            _TransactionNode.Nodes.Add("Reference3 = '" + IIf(String.IsNullOrEmpty(_Response.Transaction.Reference3), String.Empty, _Response.Transaction.Reference3) + "'")
            _TransactionNode.Nodes.Add("Reference4 = '" + IIf(String.IsNullOrEmpty(_Response.Transaction.Reference4), String.Empty, _Response.Transaction.Reference4) + "'")
            _TransactionNode.Nodes.Add("Reference5 = '" + IIf(String.IsNullOrEmpty(_Response.Transaction.Reference5), String.Empty, _Response.Transaction.Reference5) + "'")
        End If

        Dim _HasErrorsNode As New TreeNode("HasErrors = '" + _Response.HasErrors.ToString() + "'")

        Dim _NotificationsNode As New TreeNode("Notifications")
        If (_Response.Notifications IsNot Nothing) Then
            For _Index As Integer = 0 To _Response.Notifications.Count - 1
                Dim _NotificationNode As New TreeNode("Notification " + (_Index + 1).ToString())
                _NotificationNode.Nodes.Add("Code = '" + _Response.Notifications(_Index).Code + "'")
                _NotificationNode.Nodes.Add("Message = '" + _Response.Notifications(_Index).Message + "'")

                _NotificationsNode.Nodes.Add(_NotificationNode)
            Next
        End If

        Dim _RootNode As New TreeNode("Response")
        _RootNode.Nodes.Add(_TransactionNode)
        _RootNode.Nodes.Add(_HasErrorsNode)
        _RootNode.Nodes.Add(_NotificationsNode)

        tvResponse.Nodes.Add(_RootNode)
        tvResponse.ExpandAll()
    End Sub

    Private Sub btnExit_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnExit.Click
        Me.Close()
    End Sub
#End Region

End Class