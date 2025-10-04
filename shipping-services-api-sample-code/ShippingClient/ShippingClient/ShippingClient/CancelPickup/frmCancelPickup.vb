Imports ShippingClient.ShippingReference

Public Class frmCancelPickup
    Private Sub btnReset_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnReset.Click
        Cursor.Current = Cursors.WaitCursor

        txtPickupGUID.Text = String.Empty

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnSubmitRequest_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSubmitRequest.Click
        Cursor.Current = Cursors.WaitCursor

        Dim _Request As New PickupCancelationRequest

        'ClientInfo
        _Request.ClientInfo = New ClientInfo
        _Request.ClientInfo = New ClientInfo
        _Request.ClientInfo.AccountCountryCode = txtAccountCountryCode.Text.Trim()
        _Request.ClientInfo.AccountEntity = txtAccountEntity.Text.Trim()
        _Request.ClientInfo.AccountNumber = txtAccountNumber.Text.Trim()
        _Request.ClientInfo.AccountPin = txtAccountPin.Text.Trim()
        _Request.ClientInfo.UserName = txtUsername.Text.Trim()
        _Request.ClientInfo.Password = txtPassword.Text.Trim()
        _Request.ClientInfo.Version = txtVersion.Text.Trim()

        'Transaction
        _Request.Transaction = New Transaction
        _Request.Transaction.Reference1 = txtReference1.Text.Trim()
        _Request.Transaction.Reference2 = txtReference2.Text.Trim()
        _Request.Transaction.Reference3 = txtReference3.Text.Trim()
        _Request.Transaction.Reference4 = txtReference4.Text.Trim()
        _Request.Transaction.Reference5 = txtReference5.Text.Trim()

        _Request.PickupGUID = txtPickupGUID.Text.Trim()
        _Request.Comments = txtComments.Text.Trim()

        Dim _Response As PickupCancelationResponse = Nothing
        Dim _Client As New Service_1_0Client

        Try
            _Client.Open()
            _Response = _Client.CancelPickup(_Request)
            _Client.Close()

            Using _frmCancelPickupCallResponse As New frmCancelPickupCallResponse
                _frmCancelPickupCallResponse.Response = _Response
                _frmCancelPickupCallResponse.ShowDialog(Me)
            End Using
        Catch ex As Exception
            MessageBox.Show(ex.Message)
        End Try

        Cursor.Current = Cursors.Default
    End Sub
End Class