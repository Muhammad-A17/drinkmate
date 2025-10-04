Imports ShippingClient.ShippingReference

Public Class frmMain

    Private Sub btnCreateShipments_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnCreateShipments.Click
        Using _frmShipments As New Form1
            _frmShipments.ShowDialog(Me)
        End Using
    End Sub

    Private Sub btnPrintLabel_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnPrintLabel.Click
        Using _frmLabel As New frmPrintLabel
            _frmLabel.ShowDialog(Me)
        End Using
    End Sub

    Private Sub btnExit_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnExit.Click
        Me.Close()
    End Sub

    Private Sub btnCreatePickup_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnCreatePickup.Click
        Using _frmPickup As New frmPickup
            _frmPickup.ShowDialog(Me)
        End Using
    End Sub

    Private Sub btnCancelPickup_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnCancelPickup.Click
        Using _frmCancelPickup As New frmCancelPickup
            _frmCancelPickup.ShowDialog(Me)
        End Using
    End Sub
End Class