Imports ShippingClient.ShippingReference

Public Class frmPickup

#Region "Members"
    Private _PickupItems As New List(Of PickupItemDetail)
    Private _Shipments As List(Of Shipment) = Nothing
#End Region

#Region "Methods"
    Private Sub FillItems()
        lvPickupItems.Items.Clear()
        If (_PickupItems IsNot Nothing AndAlso _PickupItems.Count > 0) Then
            For Each _PickupItem As PickupItemDetail In _PickupItems
                Dim _Item As New ListViewItem
                _Item.Text = _PickupItem.ProductGroup
                _Item.SubItems.Add(_PickupItem.ProductType)
                _Item.SubItems.Add(_PickupItem.Payment)
                _Item.SubItems.Add(_PickupItem.PackageType)
                _Item.SubItems.Add(_PickupItem.NumberOfShipments)
                _Item.SubItems.Add(_PickupItem.NumberOfPieces)
                If (_PickupItem.ShipmentWeight IsNot Nothing) Then
                    _Item.SubItems.Add(_PickupItem.ShipmentWeight.Value.ToString + " " + _PickupItem.ShipmentWeight.Unit)
                Else
                    _Item.SubItems.Add(String.Empty)
                End If
                If (_PickupItem.ShipmentVolume IsNot Nothing) Then
                    _Item.SubItems.Add(_PickupItem.ShipmentVolume.Value.ToString() + " " + _PickupItem.ShipmentVolume.Unit)
                Else
                    _Item.SubItems.Add(String.Empty)
                End If
                If (_PickupItem.CashAmount IsNot Nothing) Then
                    _Item.SubItems.Add(_PickupItem.CashAmount.Value.ToString() + " " + _PickupItem.CashAmount.CurrencyCode)
                Else
                    _Item.SubItems.Add(String.Empty)
                End If
                If (_PickupItem.ExtraCharges IsNot Nothing) Then
                    _Item.SubItems.Add(_PickupItem.ExtraCharges.Value.ToString() + " " + _PickupItem.ExtraCharges.CurrencyCode)
                Else
                    _Item.SubItems.Add(String.Empty)
                End If
                If (_PickupItem.ShipmentDimensions IsNot Nothing) Then
                    _Item.SubItems.Add(_PickupItem.ShipmentDimensions.Length.ToString() + " x " + _PickupItem.ShipmentDimensions.Width.ToString() + " x " + _PickupItem.ShipmentDimensions.Height.ToString() + " " + _PickupItem.ShipmentDimensions.Unit)
                Else
                    _Item.SubItems.Add(String.Empty)
                End If
                _Item.SubItems.Add(_PickupItem.Comments)

                lvPickupItems.Items.Add(_Item)
            Next
        End If
    End Sub

    Private Sub btnPickupDetailAdd_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnPickupDetailAdd.Click
        Cursor.Current = Cursors.WaitCursor

        Dim _PickupItem As New PickupItemDetail
        _PickupItem.ProductGroup = txtPickupItemDetailProductGroup.Text.Trim()
        _PickupItem.ProductType = txtPickupItemDetailProductType.Text.Trim()
        _PickupItem.Payment = txtPickupItemDetailPaymentType.Text.Trim()
        _PickupItem.PackageType = txtPickupItemDetailPackageType.Text.Trim()
        _PickupItem.NumberOfShipments = Convert.ToInt32(nudPickupItemDetailNumberOfShipments.Value)
        _PickupItem.NumberOfPieces = Convert.ToInt32(nudPickupItemDetailNumberOfPieces.Value)
        If (nudPickupItemDetailWeight.Value <> 0 AndAlso cmbPickupItemDetailWeightUnit.SelectedIndex <> -1) Then
            _PickupItem.ShipmentWeight = New Weight
            _PickupItem.ShipmentWeight.Value = nudPickupItemDetailWeight.Value
            _PickupItem.ShipmentWeight.Unit = cmbPickupItemDetailWeightUnit.Text
        End If
        If (nudPickupItemDetailVolume.Value <> 0 AndAlso cmbPickupItemDetailVolumeUnit.SelectedIndex <> -1) Then
            _PickupItem.ShipmentVolume = New Volume
            _PickupItem.ShipmentVolume.Value = nudPickupItemDetailVolume.Value
            _PickupItem.ShipmentVolume.Unit = cmbPickupItemDetailVolumeUnit.Text
        End If
        If (nudPickupItemDetailCashAmount.Value <> 0 AndAlso Not String.IsNullOrEmpty(txtPickupItemDetailCashAmountCurrency.Text)) Then
            _PickupItem.CashAmount = New Money
            _PickupItem.CashAmount.Value = nudPickupItemDetailCashAmount.Value
            _PickupItem.CashAmount.CurrencyCode = txtPickupItemDetailCashAmountCurrency.Text.Trim()
        End If
        If (nudPickupItemDetailExtraCharges.Value <> 0 AndAlso Not String.IsNullOrEmpty(txtPickupItemDetailExtraChargesCurrency.Text)) Then
            _PickupItem.ExtraCharges = New Money
            _PickupItem.ExtraCharges.Value = nudPickupItemDetailExtraCharges.Value
            _PickupItem.ExtraCharges.CurrencyCode = txtPickupItemDetailExtraChargesCurrency.Text.Trim()
        End If
        _PickupItem.ShipmentDimensions = New Dimensions
        _PickupItem.ShipmentDimensions.Length = nudPickupItemDetailLength.Value
        _PickupItem.ShipmentDimensions.Width = nudPickupItemDetailWidth.Value
        _PickupItem.ShipmentDimensions.Height = nudPickupItemDetailHeight.Value
        _PickupItem.ShipmentDimensions.Unit = cmbPickupItemDetailUnit.Text
        _PickupItem.Comments = txtPickupItemDetailComments.Text.Trim()

        _PickupItems.Add(_PickupItem)
        FillItems()

        txtPickupItemDetailProductGroup.Text = String.Empty
        txtPickupItemDetailProductType.Text = String.Empty
        txtPickupItemDetailPaymentType.Text = String.Empty
        txtPickupItemDetailPackageType.Text = String.Empty
        nudPickupItemDetailNumberOfShipments.Value = 0
        nudPickupItemDetailNumberOfPieces.Value = 0
        nudPickupItemDetailWeight.Value = 0
        cmbPickupItemDetailWeightUnit.SelectedIndex = -1
        nudPickupItemDetailVolume.Value = 0
        cmbPickupItemDetailVolumeUnit.SelectedIndex = -1
        nudPickupItemDetailCashAmount.Value = 0
        txtPickupItemDetailCashAmountCurrency.Text = String.Empty
        nudPickupItemDetailExtraCharges.Value = 0
        txtPickupItemDetailExtraChargesCurrency.Text = String.Empty
        nudPickupItemDetailLength.Value = 0
        nudPickupItemDetailWidth.Value = 0
        nudPickupItemDetailHeight.Value = 0
        cmbPickupItemDetailUnit.SelectedIndex = -1
        txtPickupItemDetailComments.Text = String.Empty

        txtPickupItemDetailProductGroup.Focus()

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnPickupDetailDelete_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnPickupDetailDelete.Click
        Cursor.Current = Cursors.WaitCursor

        If (_PickupItems IsNot Nothing AndAlso _PickupItems.Count > 0) Then
            If (lvPickupItems.SelectedItems.Count > 0) Then
                _PickupItems.RemoveAt(lvPickupItems.SelectedItems(0).Index)
                FillItems()
            End If
        End If

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnSubmitRequest_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSubmitRequest.Click
        Cursor.Current = Cursors.WaitCursor

        Dim _Request As New PickupCreationRequest

        'ClientInfo
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

        'Pickup
        _Request.Pickup = New Pickup

        'PickupContact
        _Request.Pickup.PickupContact = New Contact
        _Request.Pickup.PickupContact.Department = txtPickupContactDepartment.Text.Trim()
        _Request.Pickup.PickupContact.PersonName = txtPickupContactPersonName.Text.Trim()
        _Request.Pickup.PickupContact.Title = txtPickupContactTitle.Text.Trim()
        _Request.Pickup.PickupContact.CompanyName = txtPickupContactCompanyName.Text.Trim()
        _Request.Pickup.PickupContact.PhoneNumber1 = txtPickupContactPhoneNumber1.Text.Trim()
        _Request.Pickup.PickupContact.PhoneNumber1Ext = txtPickupContactPhoneNumber1Ext.Text.Trim()
        _Request.Pickup.PickupContact.PhoneNumber2 = txtPickupContactPhoneNumber2.Text.Trim()
        _Request.Pickup.PickupContact.PhoneNumber2Ext = txtPickupContactPhoneNumber2Ext.Text.Trim()
        _Request.Pickup.PickupContact.FaxNumber = txtPickupContactFaxNumber.Text.Trim()
        _Request.Pickup.PickupContact.CellPhone = txtPickupContactCellPhone.Text.Trim()
        _Request.Pickup.PickupContact.EmailAddress = txtPickupContactEmailAddress.Text.Trim()
        _Request.Pickup.PickupContact.Type = txtPickupContactType.Text.Trim()

        'PickupAddress
        _Request.Pickup.PickupAddress = New Address
        _Request.Pickup.PickupAddress.Line1 = txtPickupAddressLine1.Text.Trim()
        _Request.Pickup.PickupAddress.Line2 = txtPickupAddressLine2.Text.Trim()
        _Request.Pickup.PickupAddress.Line3 = txtPickupAddressLine3.Text.Trim()
        _Request.Pickup.PickupAddress.City = txtPickupAddressCity.Text.Trim()
        _Request.Pickup.PickupAddress.StateOrProvinceCode = txtPickupAddressState.Text.Trim()
        _Request.Pickup.PickupAddress.PostCode = txtPickupAddressPostCode.Text.Trim()
        _Request.Pickup.PickupAddress.CountryCode = txtPickupAddressCountry.Text.Trim()

        'ClosingTime
        _Request.Pickup.ClosingTime = dtpPickupClosingTime.Value

        'Comments
        _Request.Pickup.Comments = txtPickupComments.Text.Trim()

        'LastPickupTime
        _Request.Pickup.LastPickupTime = dtpPickupLatestTime.Value

        'PickupDate 
        _Request.Pickup.PickupDate = dtpPickupDate.Value

        'PickupLocation 
        _Request.Pickup.PickupLocation = txtPickupLocation.Text.Trim()

        'ReadyTime 
        _Request.Pickup.ReadyTime = dtpPickupReadyTime.Value

        'Reference1
        _Request.Pickup.Reference1 = txtPickupReference1.Text.Trim()

        'Reference2
        _Request.Pickup.Reference2 = txtPickupReference2.Text.Trim()

        'Vehicle
        _Request.Pickup.Vehicle = txtPickupVehicle.Text.Trim()

        'Status
        _Request.Pickup.Status = txtPickupStatus.Text.Trim()

        'Items
        _Request.Pickup.PickupItems = _PickupItems.ToArray()

        'Shipments
        _Request.Pickup.Shipments = If(IsNothing(_Shipments), Nothing, _Shipments.ToArray)

        _Request.LabelInfo = Nothing
        If (chkbGenerateLabels.Checked) Then
            _Request.LabelInfo = New LabelInfo
            _Request.LabelInfo.ReportID = Convert.ToInt32(nudReportID.Value)
            If (rbReportAsURL.Checked) Then _Request.LabelInfo.ReportType = "URL"
            If (rbReportAsFile.Checked) Then _Request.LabelInfo.ReportType = "RPT"
        End If

        Dim _Response As PickupCreationResponse = Nothing
        Dim _Client As New Service_1_0Client

        Try
            _Client.Open()
            _Response = _Client.CreatePickup(_Request)
            _Client.Close()

            Using _frmPickupCallResponse As New frmPickupCallResponse
                _frmPickupCallResponse.Response = _Response
                _frmPickupCallResponse.ShowDialog(Me)
            End Using
        Catch ex As Exception
            MessageBox.Show(ex.Message)
        End Try

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnAddShipments_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnAddShipments.Click
        Using _frmPickupShipments As New frmPickupShipments()
            _frmPickupShipments.Shipments = _Shipments
            If (_frmPickupShipments.ShowDialog(Me) = DialogResult.OK) Then
                _Shipments = _frmPickupShipments.Shipments
            End If
        End Using
    End Sub

    Private Sub frmPickup_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        rbReportAsURL.Checked = True
        chkbGenerateLabels.Checked = False
        chkbGenerateLabels_CheckedChanged(Nothing, Nothing)
    End Sub

    Private Sub chkbGenerateLabels_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles chkbGenerateLabels.CheckedChanged
        nudReportID.Enabled = chkbGenerateLabels.Checked
        rbReportAsFile.Enabled = chkbGenerateLabels.Checked
        rbReportAsURL.Enabled = chkbGenerateLabels.Checked
    End Sub
#End Region

End Class