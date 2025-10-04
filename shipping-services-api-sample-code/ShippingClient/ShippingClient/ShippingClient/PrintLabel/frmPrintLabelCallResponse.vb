Imports ShippingClient.ShippingReference

Public Class frmPrintLabelCallResponse

#Region "Members"
    Private _Response As LabelPrintingResponse = Nothing
    Private _ReportType As String = String.Empty
#End Region

#Region "Properties"
    Public WriteOnly Property Response As LabelPrintingResponse
        Set(ByVal value As LabelPrintingResponse)
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
    Private Sub frmPrintLabelCallResponse_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
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

        Dim _ShipmentNumberNode As New TreeNode("ShipmentNumber = '" + _Response.ShipmentNumber + "'")
        
        Dim _RootNode As New TreeNode("Response")
        _RootNode.Nodes.Add(_TransactionNode)
        _RootNode.Nodes.Add(_HasErrorsNode)
        _RootNode.Nodes.Add(_NotificationsNode)
        _RootNode.Nodes.Add(_ShipmentNumberNode)
        If (_Response.HasErrors = False) Then
            If (_Response.ShipmentLabel IsNot Nothing) Then
                Dim _ShipmentLabel As New TreeNode
                Select Case _ReportType.Trim().ToUpper()
                    Case "URL"
                        _ShipmentLabel.Text = "Label URL"
                        _ShipmentLabel.Tag = _Response.ShipmentLabel.LabelURL

                    Case "RPT"
                        _ShipmentLabel.Text = "Label PDF File"
                        _ShipmentLabel.Tag = _Response.ShipmentLabel.LabelFileContents
                End Select

                _RootNode.Nodes.Add(_ShipmentLabel)
            End If
        End If

        tvResponse.Nodes.Add(_RootNode)
        tvResponse.ExpandAll()
    End Sub

    Private Sub tvResponse_DoubleClick(ByVal sender As Object, ByVal e As System.EventArgs) Handles tvResponse.DoubleClick
        Cursor.Current = Cursors.WaitCursor

        Dim _SelectedNode As TreeNode = tvResponse.SelectedNode

        Select Case _SelectedNode.Text
            Case "Label URL"
                Process.Start(_SelectedNode.Tag.ToString())

            Case "Label PDF File"
                Dim _TempPath As String = System.IO.Path.GetTempPath()
                Dim _FileName As String = _TempPath + Guid.NewGuid().ToString() + ".pdf"
                System.IO.File.WriteAllBytes(_FileName, _SelectedNode.Tag)
                Process.Start(_FileName)
        End Select

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnExit_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnExit.Click
        Me.Close()
    End Sub
#End Region

End Class