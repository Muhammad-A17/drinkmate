Imports ShippingClient.ShippingReference

Public Class frmPrintLabel

    Private Sub frmPrintLabel_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        rbReportAsURL.Checked = True
        rbReportAsFile.Checked = False
    End Sub

    Private Sub btnSubmitRequest_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSubmitRequest.Click
        Cursor.Current = Cursors.WaitCursor

        Dim _Request As New LabelPrintingRequest
        _Request.ClientInfo = New ClientInfo
        _Request.ClientInfo.AccountCountryCode = txtAccountCountryCode.Text.Trim()
        _Request.ClientInfo.AccountEntity = txtAccountEntity.Text.Trim()
        _Request.ClientInfo.AccountNumber = txtAccountNumber.Text.Trim()
        _Request.ClientInfo.AccountPin = txtAccountPin.Text.Trim()
        _Request.ClientInfo.UserName = txtUsername.Text.Trim()
        _Request.ClientInfo.Password = txtPassword.Text.Trim()
        _Request.ClientInfo.Version = txtVersion.Text.Trim()

        _Request.Transaction = New Transaction
        _Request.Transaction.Reference1 = txtReference1.Text.Trim()
        _Request.Transaction.Reference2 = txtReference2.Text.Trim()
        _Request.Transaction.Reference3 = txtReference3.Text.Trim()
        _Request.Transaction.Reference4 = txtReference4.Text.Trim()
        _Request.Transaction.Reference5 = txtReference5.Text.Trim()

        _Request.ShipmentNumber = txtShipmentNumber.Text.Trim()
        _Request.ProductGroup = txtProductGroup.Text.Trim()
        _Request.OriginEntity = txtOriginEntity.Text.Trim()

        _Request.LabelInfo = New LabelInfo
        _Request.LabelInfo.ReportID = Convert.ToInt32(nudReportID.Value)
        If (rbReportAsURL.Checked) Then _Request.LabelInfo.ReportType = "URL"
        If (rbReportAsFile.Checked) Then _Request.LabelInfo.ReportType = "RPT"

        Dim _Response As LabelPrintingResponse = Nothing
        Dim _Client As New Service_1_0Client

        Try
            _Client.Open()
            _Response = _Client.PrintLabel(_Request)
            _Client.Close()

            Using _frmPrintLabelCallResponse As New frmPrintLabelCallResponse
                _frmPrintLabelCallResponse.Response = _Response
                _frmPrintLabelCallResponse.ReportType = _Request.LabelInfo.ReportType
                _frmPrintLabelCallResponse.ShowDialog(Me)
            End Using
        Catch ex As Exception
            MessageBox.Show(ex.Message)
        End Try

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnReset_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnReset.Click
        Cursor.Current = Cursors.WaitCursor

        txtShipmentNumber.Text = String.Empty
        txtProductGroup.Text = String.Empty
        txtOriginEntity.Text = String.Empty

        Cursor.Current = Cursors.Default
    End Sub
End Class