Imports ShippingClient.ShippingReference

Public Class frmPickupCallResponse

#Region "Members"
    Private _Response As PickupCreationResponse = Nothing
    Private _ReportType As String = String.Empty
#End Region

#Region "Properties"
    Public WriteOnly Property Response As PickupCreationResponse
        Set(ByVal value As PickupCreationResponse)
            _Response = value
        End Set
    End Property

    Public WriteOnly Property ReportType As String
        Set(ByVal value As String)
            _ReportType = value
        End Set
    End Property
#End Region

#Region "Methods"
    Private Sub frmPickupCallResponse_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
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

        Dim _PickupNode As New TreeNode("Pickup")
        If (_Response.ProcessedPickup IsNot Nothing) Then
            _PickupNode.Nodes.Add(_Response.ProcessedPickup.ID)
            _PickupNode.Nodes.Add(_Response.ProcessedPickup.GUID.ToString())
            _PickupNode.Nodes.Add("Reference1 = '" + _Response.ProcessedPickup.Reference1 + "'")
            _PickupNode.Nodes.Add("Reference2 = '" + _Response.ProcessedPickup.Reference2 + "'")

            Dim _ShipmentsNode As New TreeNode("Shipments")
            If (_Response.ProcessedPickup.ProcessedShipments IsNot Nothing AndAlso _Response.ProcessedPickup.ProcessedShipments.Length > 0) Then
                For Each _Shipment As ProcessedShipment In _Response.ProcessedPickup.ProcessedShipments
                    Dim _ShipmentNode As New TreeNode(_Shipment.ID)
                    _ShipmentNode.Nodes.Add("Reference1 = '" + _Shipment.Reference1 + "'")
                    _ShipmentNode.Nodes.Add("Reference2 = '" + _Shipment.Reference2 + "'")
                    _ShipmentNode.Nodes.Add("Reference3 = '" + _Shipment.Reference3 + "'")
                    _ShipmentNode.Nodes.Add("ForeignHAWB = '" + _Shipment.ForeignHAWB + "'")
                    _ShipmentNode.Nodes.Add("HasErrors = '" + _Shipment.HasErrors.ToString() + "'")

                    Dim _ShipmentNodeNotifications As New TreeNode("Notifications")
                    If (_Shipment.Notifications IsNot Nothing) Then
                        For Each _ShipmentNotification As Notification In _Shipment.Notifications
                            Dim _ShipmentNotificationNode As New TreeNode("Notification")
                            _ShipmentNotificationNode.Nodes.Add("Code = '" + _ShipmentNotification.Code + "'")
                            _ShipmentNotificationNode.Nodes.Add("Message = '" + _ShipmentNotification.Message + "'")
                            _ShipmentNodeNotifications.Nodes.Add(_ShipmentNotificationNode)
                        Next
                    End If
                    _ShipmentNode.Nodes.Add(_ShipmentNodeNotifications)

                    Dim _ShipmentLabel As New TreeNode
                    If (_Shipment.ShipmentLabel Is Nothing) Then
                        _ShipmentLabel.Text = "No Label"
                        _ShipmentLabel.Tag = Nothing
                    ElseIf (Not String.IsNullOrEmpty(_Shipment.ShipmentLabel.LabelURL) AndAlso _Shipment.ShipmentLabel.LabelFileContents Is Nothing) Then
                        _ShipmentLabel.Text = "Label URL"
                        _ShipmentLabel.Tag = _Shipment.ShipmentLabel.LabelURL
                    ElseIf (String.IsNullOrEmpty(_Shipment.ShipmentLabel.LabelURL) AndAlso _Shipment.ShipmentLabel.LabelFileContents IsNot Nothing) Then
                        _ShipmentLabel.Text = "Label PDF File"
                        _ShipmentLabel.Tag = _Shipment.ShipmentLabel.LabelFileContents
                    End If
                    _ShipmentNode.Nodes.Add(_ShipmentLabel)

                    _ShipmentsNode.Nodes.Add(_ShipmentNode)
                Next

                _PickupNode.Nodes.Add(_ShipmentsNode)
            End If

        End If

        Dim _RootNode As New TreeNode("Response")
        _RootNode.Nodes.Add(_TransactionNode)
        _RootNode.Nodes.Add(_HasErrorsNode)
        _RootNode.Nodes.Add(_NotificationsNode)
        _RootNode.Nodes.Add(_PickupNode)

        tvResponse.Nodes.Add(_RootNode)
        tvResponse.ExpandAll()
    End Sub

    Private Sub btnExit_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnExit.Click
        Me.Close()
    End Sub
#End Region
    
End Class