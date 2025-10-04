Imports ShippingClient.ShippingReference

Public Class frmPickupShipments

#Region "Members"
    Private _Shipments As New List(Of Shipment)
    Private _Shipment As Shipment = Nothing
    Private _Attachments As New List(Of Attachment)
    Private _Items As New List(Of ShipmentItem)
#End Region

#Region "Properties"
    Public Property Shipments As List(Of Shipment)
        Get
            Return _Shipments
        End Get
        Set(ByVal value As List(Of Shipment))
            _Shipments = value
        End Set
    End Property
#End Region

#Region "Methods"
    Private Sub frmPickupShipments_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        FillShipments()
    End Sub

    Private Sub ClearShipment()
        'Shipper
        txtShipperReference1.Text = String.Empty
        txtShipperReference2.Text = String.Empty
        txtShipperAccountNumber.Text = String.Empty

        txtShipperAddressLine1.Text = String.Empty
        txtShipperAddressLine2.Text = String.Empty
        txtShipperAddressLine3.Text = String.Empty
        txtShipperAddressCity.Text = String.Empty
        txtShipperAddressState.Text = String.Empty
        txtShipperAddressPostCode.Text = String.Empty
        txtShipperAddressCountry.Text = String.Empty

        txtShipperContactDepartment.Text = String.Empty
        txtShipperContactPersonName.Text = String.Empty
        txtShipperContactTitle.Text = String.Empty
        txtShipperContactCompanyName.Text = String.Empty
        txtShipperContactPhoneNumber1.Text = String.Empty
        txtShipperContactPhoneNumber1Ext.Text = String.Empty
        txtShipperContactPhoneNumber2.Text = String.Empty
        txtShipperContactPhoneNumber2Ext.Text = String.Empty
        txtShipperContactFaxNumber.Text = String.Empty
        txtShipperContactCellPhone.Text = String.Empty
        txtShipperContactEmailAddress.Text = String.Empty
        txtShipperContactType.Text = String.Empty

        'Recipient
        txtRecipientReference1.Text = String.Empty
        txtRecipientReference2.Text = String.Empty
        txtRecipientAccountNumber.Text = String.Empty

        txtRecipientAddressLine1.Text = String.Empty
        txtRecipientAddressLine2.Text = String.Empty
        txtRecipientAddressLine3.Text = String.Empty
        txtRecipientAddressCity.Text = String.Empty
        txtRecipientAddressState.Text = String.Empty
        txtRecipientAddressPostCode.Text = String.Empty
        txtRecipientAddressCountry.Text = String.Empty

        txtRecipientContactDepartment.Text = String.Empty
        txtRecipientContactPersonName.Text = String.Empty
        txtRecipientContactTitle.Text = String.Empty
        txtRecipientContactCompanyName.Text = String.Empty
        txtRecipientContactPhoneNumber1.Text = String.Empty
        txtRecipientContactPhoneNumber1Ext.Text = String.Empty
        txtRecipientContactPhoneNumber2.Text = String.Empty
        txtRecipientContactPhoneNumber2Ext.Text = String.Empty
        txtRecipientContactFaxNumber.Text = String.Empty
        txtRecipientContactCellPhone.Text = String.Empty
        txtRecipientContactEmailAddress.Text = String.Empty
        txtRecipientContactType.Text = String.Empty

        'ThirdParty
        txtThirdPartyReference1.Text = String.Empty
        txtThirdPartyReference2.Text = String.Empty
        txtThirdPartyAccountNumber.Text = String.Empty

        txtThirdPartyAddressLine1.Text = String.Empty
        txtThirdPartyAddressLine2.Text = String.Empty
        txtThirdPartyAddressLine3.Text = String.Empty
        txtThirdPartyAddressCity.Text = String.Empty
        txtThirdPartyAddressState.Text = String.Empty
        txtThirdPartyAddressPostCode.Text = String.Empty
        txtThirdPartyAddressCountry.Text = String.Empty

        txtThirdPartyContactDepartment.Text = String.Empty
        txtThirdPartyContactPersonName.Text = String.Empty
        txtThirdPartyContactTitle.Text = String.Empty
        txtThirdPartyContactCompanyName.Text = String.Empty
        txtThirdPartyContactPhoneNumber1.Text = String.Empty
        txtThirdPartyContactPhoneNumber1Ext.Text = String.Empty
        txtThirdPartyContactPhoneNumber2.Text = String.Empty
        txtThirdPartyContactPhoneNumber2Ext.Text = String.Empty
        txtThirdPartyContactFaxNumber.Text = String.Empty
        txtThirdPartyContactCellPhone.Text = String.Empty
        txtThirdPartyContactEmailAddress.Text = String.Empty
        txtThirdPartyContactType.Text = String.Empty

        'Main information
        txtShipmentReference1.Text = String.Empty
        txtShipmentReference2.Text = String.Empty
        txtShipmentReference3.Text = String.Empty
        txtForeignHAWB.Text = String.Empty
        nudShipmentTransportType.Value = 0

        dtpShipmentShippingDate.Value = Now
        dtpShipmentShippingDueDate.Value = Now

        txtShipmentAttachment.Text = String.Empty
        lbShipmentAttachments.Items.Clear()

        txtShipmentPickupLocation.Text = String.Empty
        txtShipmentComments.Text = String.Empty
        txtShipmentAccountingInstructions.Text = String.Empty
        txtShipmentOperationsInstructions.Text = String.Empty

        'Details
        nudShipmentDetailsDimensionsLength.Value = 0
        nudShipmentDetailsDimensionsWidth.Value = 0
        nudShipmentDetailsDimensionsHeight.Value = 0
        cmbShipmentDetailsDimensionsUnit.SelectedIndex = -1

        nudShipmentDetailsActualWeightValue.Value = 0
        cmbShipmentDetailsActualWeightUnit.SelectedIndex = -1

        txtShipmentDetailsProductGroup.Text = String.Empty
        txtShipmentDetailsProductType.Text = String.Empty
        txtShipmentDetailsPaymentType.Text = String.Empty
        txtShipmentDetailsPaymentOptions.Text = String.Empty
        txtShipmentDetailsServices.Text = String.Empty
        nudShipmentDetailsNumberOfPieces.Value = 0
        txtShipmentDetailsDescriptionOfGoods.Text = String.Empty
        txtShipmentDetailsGoodsOrigin.Text = String.Empty

        nudShipmentDetailsCashOnDeliveryAmountValue.Value = 0
        txtShipmentDetailsCashOnDeliveryAmountCurrency.Text = String.Empty
        txtShipmentDetailsCashAdditionalDescription.Text = String.Empty
        nudShipmentDetailsInsuranceValue.Value = 0
        txtShipmentDetailsInsuranceCurrency.Text = String.Empty
        nudShipmentDetailsCollectValue.Value = 0
        txtShipmentDetailsCollectCurrency.Text = String.Empty
        nudShipmentDetailsCashAdditionalValue.Value = 0
        txtShipmentDetailsCashAdditionalCurrency.Text = String.Empty
        nudShipmentDetailsCustomsValue.Value = 0
        txtShipmentDetailsCustomsCurrency.Text = String.Empty

        txtShipmentDetailsItemPackageType.Text = String.Empty
        nudShipmentDetailsItemQuantity.Value = 0
        nudShipmentDetailsItemWeightValue.Value = 0
        cmbShipmentDetailsItemWeightUnit.SelectedIndex = -1
        txtShipmentDetailsItemComments.Text = String.Empty
        txtShipmentDetailsItemReference.Text = String.Empty
        lvItems.Items.Clear()

        _Attachments = New List(Of Attachment)
        _Items = New List(Of ShipmentItem)
    End Sub

    Private Sub FillAttachments()
        lbShipmentAttachments.Items.Clear()
        If (_Attachments IsNot Nothing AndAlso _Attachments.Count > 0) Then
            For Each _Attachment As Attachment In _Attachments
                lbShipmentAttachments.Items.Add(_Attachment.FileName + "." + _Attachment.FileExtension)
            Next
        End If
    End Sub

    Private Sub FillItems()
        lvItems.Items.Clear()
        If (_Items IsNot Nothing AndAlso _Items.Count > 0) Then
            For Each _Item As ShipmentItem In _Items
                Dim _lvItem As New ListViewItem
                _lvItem.Text = _Item.PackageType
                _lvItem.SubItems.Add(_Item.Quantity)
                _lvItem.SubItems.Add(_Item.Weight.Value.ToString() + " " + _Item.Weight.Unit)
                _lvItem.SubItems.Add(_Item.Comments)
                _lvItem.SubItems.Add(_Item.Reference)

                lvItems.Items.Add(_lvItem)
            Next
        End If
    End Sub

    Private Sub FillShipments()
        lbShipments.Items.Clear()
        If (_Shipments IsNot Nothing AndAlso _Shipments.Count > 0) Then
            For _Index As Integer = 0 To _Shipments.Count - 1
                lbShipments.Items.Add("Shipment " + (_Index + 1).ToString())
            Next
        End If
    End Sub

    Private Sub btnAttachment_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnAttachment.Click
        If (ofgAttachment.ShowDialog(Me) = Windows.Forms.DialogResult.OK) Then
            txtShipmentAttachment.Text = ofgAttachment.FileName
        End If
    End Sub

    Private Sub btnAddAttachment_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnAddAttachment.Click
        If (Not String.IsNullOrEmpty(txtShipmentAttachment.Text)) Then
            Dim _FileInfo As New System.IO.FileInfo(txtShipmentAttachment.Text)
            Dim _Attachment As New Attachment
            _Attachment.FileName = _FileInfo.Name
            _Attachment.FileExtension = _FileInfo.Extension
            _Attachment.FileContents = System.IO.File.ReadAllBytes(txtShipmentAttachment.Text)

            _Attachments.Add(_Attachment)
            FillAttachments()
        End If
    End Sub

    Private Sub btnRemoveAttachment_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnRemoveAttachment.Click
        If (lbShipmentAttachments.Items.Count > 0) Then
            If (lbShipmentAttachments.SelectedIndex <> -1) Then
                _Attachments.RemoveAt(lbShipmentAttachments.SelectedIndex)
                FillAttachments()
            End If
        End If
    End Sub

    Private Sub btnAddItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnAddItem.Click
        Dim _Item As New ShipmentItem
        _Item.PackageType = txtShipmentDetailsItemPackageType.Text.Trim()
        _Item.Quantity = Convert.ToInt32(nudShipmentDetailsItemQuantity.Value)
        _Item.Weight = New Weight
        _Item.Weight.Value = Convert.ToDouble(nudShipmentDetailsItemWeightValue.Value)
        _Item.Weight.Unit = cmbShipmentDetailsItemWeightUnit.Text
        _Item.Comments = txtShipmentDetailsItemComments.Text.Trim()
        _Item.Reference = txtShipmentDetailsItemReference.Text.Trim()

        _Items.Add(_Item)
        FillItems()

        txtShipmentDetailsItemPackageType.Text = String.Empty
        nudShipmentDetailsItemQuantity.Value = 0
        nudShipmentDetailsItemWeightValue.Value = 0
        cmbShipmentDetailsItemWeightUnit.SelectedIndex = -1
        txtShipmentDetailsItemComments.Text = String.Empty
        txtShipmentDetailsItemReference.Text = String.Empty
    End Sub

    Private Sub btnRemoveItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnRemoveItem.Click
        If (_Items IsNot Nothing AndAlso _Items.Count > 0) Then
            If (lvItems.SelectedItems.Count > 0) Then
                _Items.RemoveAt(lvItems.SelectedItems(0).Index)
                FillItems()
            End If
        End If
    End Sub

    Private Sub btnAddShipment_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnAddShipment.Click
        _Shipment = New Shipment

        'Shipper
        _Shipment.Shipper = New Party
        _Shipment.Shipper.Reference1 = txtShipperReference1.Text.Trim()
        _Shipment.Shipper.Reference2 = txtShipperReference2.Text.Trim()
        _Shipment.Shipper.AccountNumber = txtShipperAccountNumber.Text.Trim()

        _Shipment.Shipper.PartyAddress = New Address
        _Shipment.Shipper.PartyAddress.Line1 = txtShipperAddressLine1.Text.Trim()
        _Shipment.Shipper.PartyAddress.Line2 = txtShipperAddressLine2.Text.Trim()
        _Shipment.Shipper.PartyAddress.Line3 = txtShipperAddressLine3.Text.Trim()
        _Shipment.Shipper.PartyAddress.City = txtShipperAddressCity.Text.Trim()
        _Shipment.Shipper.PartyAddress.StateOrProvinceCode = txtShipperAddressState.Text.Trim()
        _Shipment.Shipper.PartyAddress.PostCode = txtShipperAddressPostCode.Text.Trim()
        _Shipment.Shipper.PartyAddress.CountryCode = txtShipperAddressCountry.Text.Trim()

        _Shipment.Shipper.Contact = New Contact
        _Shipment.Shipper.Contact.Department = txtShipperContactDepartment.Text.Trim()
        _Shipment.Shipper.Contact.PersonName = txtShipperContactPersonName.Text.Trim()
        _Shipment.Shipper.Contact.Title = txtShipperContactTitle.Text.Trim()
        _Shipment.Shipper.Contact.CompanyName = txtShipperContactCompanyName.Text.Trim()
        _Shipment.Shipper.Contact.PhoneNumber1 = txtShipperContactPhoneNumber1.Text.Trim()
        _Shipment.Shipper.Contact.PhoneNumber1Ext = txtShipperContactPhoneNumber1Ext.Text.Trim()
        _Shipment.Shipper.Contact.PhoneNumber2 = txtShipperContactPhoneNumber2.Text.Trim()
        _Shipment.Shipper.Contact.PhoneNumber2Ext = txtShipperContactPhoneNumber2Ext.Text.Trim()
        _Shipment.Shipper.Contact.FaxNumber = txtShipperContactFaxNumber.Text.Trim()
        _Shipment.Shipper.Contact.CellPhone = txtShipperContactCellPhone.Text.Trim()
        _Shipment.Shipper.Contact.EmailAddress = txtShipperContactEmailAddress.Text.Trim()
        _Shipment.Shipper.Contact.Type = txtShipperContactType.Text.Trim()

        'Recipient
        _Shipment.Consignee = New Party
        _Shipment.Consignee.Reference1 = txtRecipientReference1.Text.Trim()
        _Shipment.Consignee.Reference2 = txtRecipientReference2.Text.Trim()
        _Shipment.Consignee.AccountNumber = txtRecipientAccountNumber.Text.Trim()

        _Shipment.Consignee.PartyAddress = New Address
        _Shipment.Consignee.PartyAddress.Line1 = txtRecipientAddressLine1.Text.Trim()
        _Shipment.Consignee.PartyAddress.Line2 = txtRecipientAddressLine2.Text.Trim()
        _Shipment.Consignee.PartyAddress.Line3 = txtRecipientAddressLine3.Text.Trim()
        _Shipment.Consignee.PartyAddress.City = txtRecipientAddressCity.Text.Trim()
        _Shipment.Consignee.PartyAddress.StateOrProvinceCode = txtRecipientAddressState.Text.Trim()
        _Shipment.Consignee.PartyAddress.PostCode = txtRecipientAddressPostCode.Text.Trim()
        _Shipment.Consignee.PartyAddress.CountryCode = txtRecipientAddressCountry.Text.Trim()

        _Shipment.Consignee.Contact = New Contact
        _Shipment.Consignee.Contact.Department = txtRecipientContactDepartment.Text.Trim()
        _Shipment.Consignee.Contact.PersonName = txtRecipientContactPersonName.Text.Trim()
        _Shipment.Consignee.Contact.Title = txtRecipientContactTitle.Text.Trim()
        _Shipment.Consignee.Contact.CompanyName = txtRecipientContactCompanyName.Text.Trim()
        _Shipment.Consignee.Contact.PhoneNumber1 = txtRecipientContactPhoneNumber1.Text.Trim()
        _Shipment.Consignee.Contact.PhoneNumber1Ext = txtRecipientContactPhoneNumber1Ext.Text.Trim()
        _Shipment.Consignee.Contact.PhoneNumber2 = txtRecipientContactPhoneNumber2.Text.Trim()
        _Shipment.Consignee.Contact.PhoneNumber2Ext = txtRecipientContactPhoneNumber2Ext.Text.Trim()
        _Shipment.Consignee.Contact.FaxNumber = txtRecipientContactFaxNumber.Text.Trim()
        _Shipment.Consignee.Contact.CellPhone = txtRecipientContactCellPhone.Text.Trim()
        _Shipment.Consignee.Contact.EmailAddress = txtRecipientContactEmailAddress.Text.Trim()
        _Shipment.Consignee.Contact.Type = txtRecipientContactType.Text.Trim()

        'ThirdParty
        _Shipment.ThirdParty = New Party
        _Shipment.ThirdParty.Reference1 = txtThirdPartyReference1.Text.Trim()
        _Shipment.ThirdParty.Reference2 = txtThirdPartyReference2.Text.Trim()
        _Shipment.ThirdParty.AccountNumber = txtThirdPartyAccountNumber.Text.Trim()

        _Shipment.ThirdParty.PartyAddress = New Address
        _Shipment.ThirdParty.PartyAddress.Line1 = txtThirdPartyAddressLine1.Text.Trim()
        _Shipment.ThirdParty.PartyAddress.Line2 = txtThirdPartyAddressLine2.Text.Trim()
        _Shipment.ThirdParty.PartyAddress.Line3 = txtThirdPartyAddressLine3.Text.Trim()
        _Shipment.ThirdParty.PartyAddress.City = txtThirdPartyAddressCity.Text.Trim()
        _Shipment.ThirdParty.PartyAddress.StateOrProvinceCode = txtThirdPartyAddressState.Text.Trim()
        _Shipment.ThirdParty.PartyAddress.PostCode = txtThirdPartyAddressPostCode.Text.Trim()
        _Shipment.ThirdParty.PartyAddress.CountryCode = txtThirdPartyAddressCountry.Text.Trim()

        _Shipment.ThirdParty.Contact = New Contact
        _Shipment.ThirdParty.Contact.Department = txtThirdPartyContactDepartment.Text.Trim()
        _Shipment.ThirdParty.Contact.PersonName = txtThirdPartyContactPersonName.Text.Trim()
        _Shipment.ThirdParty.Contact.Title = txtThirdPartyContactTitle.Text.Trim()
        _Shipment.ThirdParty.Contact.CompanyName = txtThirdPartyContactCompanyName.Text.Trim()
        _Shipment.ThirdParty.Contact.PhoneNumber1 = txtThirdPartyContactPhoneNumber1.Text.Trim()
        _Shipment.ThirdParty.Contact.PhoneNumber1Ext = txtThirdPartyContactPhoneNumber1Ext.Text.Trim()
        _Shipment.ThirdParty.Contact.PhoneNumber2 = txtThirdPartyContactPhoneNumber2.Text.Trim()
        _Shipment.ThirdParty.Contact.PhoneNumber2Ext = txtThirdPartyContactPhoneNumber2Ext.Text.Trim()
        _Shipment.ThirdParty.Contact.FaxNumber = txtThirdPartyContactFaxNumber.Text.Trim()
        _Shipment.ThirdParty.Contact.CellPhone = txtThirdPartyContactCellPhone.Text.Trim()
        _Shipment.ThirdParty.Contact.EmailAddress = txtThirdPartyContactEmailAddress.Text.Trim()
        _Shipment.ThirdParty.Contact.Type = txtThirdPartyContactType.Text.Trim()

        'Main
        _Shipment.Reference1 = txtShipmentReference1.Text.Trim()
        _Shipment.Reference2 = txtShipmentReference2.Text.Trim()
        _Shipment.Reference3 = txtShipmentReference3.Text.Trim()
        _Shipment.ForeignHAWB = txtForeignHAWB.Text.Trim()
        _Shipment.TransportType = Convert.ToInt32(nudShipmentTransportType.Value)

        _Shipment.ShippingDateTime = dtpShipmentShippingDate.Value
        _Shipment.DueDate = dtpShipmentShippingDueDate.Value

        If (_Attachments IsNot Nothing) Then _Shipment.Attachments = _Attachments.ToArray()

        _Shipment.PickupLocation = txtShipmentPickupLocation.Text.Trim()
        _Shipment.Comments = txtShipmentComments.Text.Trim()
        _Shipment.AccountingInstrcutions = txtShipmentAccountingInstructions.Text.Trim()
        _Shipment.OperationsInstructions = txtShipmentOperationsInstructions.Text.Trim()

        'Details
        _Shipment.Details = New ShipmentDetails
        _Shipment.Details.Dimensions = New Dimensions
        _Shipment.Details.Dimensions.Length = nudShipmentDetailsDimensionsLength.Value
        _Shipment.Details.Dimensions.Width = nudShipmentDetailsDimensionsWidth.Value
        _Shipment.Details.Dimensions.Height = nudShipmentDetailsDimensionsHeight.Value
        _Shipment.Details.Dimensions.Unit = cmbShipmentDetailsDimensionsUnit.Text

        If (nudShipmentDetailsActualWeightValue.Value > 0) Then
            _Shipment.Details.ActualWeight = New Weight
            _Shipment.Details.ActualWeight.Value = nudShipmentDetailsActualWeightValue.Value
            _Shipment.Details.ActualWeight.Unit = cmbShipmentDetailsActualWeightUnit.Text
        End If

        _Shipment.Details.ProductGroup = txtShipmentDetailsProductGroup.Text.Trim()
        _Shipment.Details.ProductType = txtShipmentDetailsProductType.Text.Trim()
        _Shipment.Details.PaymentType = txtShipmentDetailsPaymentType.Text.Trim()
        _Shipment.Details.PaymentOptions = txtShipmentDetailsPaymentOptions.Text.Trim()
        _Shipment.Details.Services = txtShipmentDetailsServices.Text.Trim()
        _Shipment.Details.NumberOfPieces = Convert.ToInt32(nudShipmentDetailsNumberOfPieces.Value)
        _Shipment.Details.DescriptionOfGoods = txtShipmentDetailsDescriptionOfGoods.Text.Trim()
        _Shipment.Details.GoodsOriginCountry = txtShipmentDetailsGoodsOrigin.Text.Trim()

        If (nudShipmentDetailsCashOnDeliveryAmountValue.Value > 0 AndAlso Not String.IsNullOrEmpty(txtShipmentDetailsCashOnDeliveryAmountCurrency.Text)) Then
            _Shipment.Details.CashOnDeliveryAmount = New Money
            _Shipment.Details.CashOnDeliveryAmount.Value = Convert.ToDouble(nudShipmentDetailsCashOnDeliveryAmountValue.Value)
            _Shipment.Details.CashOnDeliveryAmount.CurrencyCode = txtShipmentDetailsCashOnDeliveryAmountCurrency.Text.Trim()
        End If
        If (nudShipmentDetailsInsuranceValue.Value > 0 AndAlso Not String.IsNullOrEmpty(txtShipmentDetailsInsuranceCurrency.Text)) Then
            _Shipment.Details.InsuranceAmount = New Money
            _Shipment.Details.InsuranceAmount.Value = Convert.ToDouble(nudShipmentDetailsInsuranceValue.Value)
            _Shipment.Details.InsuranceAmount.CurrencyCode = txtShipmentDetailsInsuranceCurrency.Text.Trim()
        End If
        If (nudShipmentDetailsCollectValue.Value > 0 AndAlso Not String.IsNullOrEmpty(txtShipmentDetailsCollectCurrency.Text)) Then
            _Shipment.Details.CollectAmount = New Money
            _Shipment.Details.CollectAmount.Value = Convert.ToDouble(nudShipmentDetailsCollectValue.Value)
            _Shipment.Details.CollectAmount.CurrencyCode = txtShipmentDetailsCollectCurrency.Text.Trim()
        End If
        If (nudShipmentDetailsCashAdditionalValue.Value > 0 AndAlso Not String.IsNullOrEmpty(txtShipmentDetailsCashAdditionalCurrency.Text)) Then
            _Shipment.Details.CashAdditionalAmount = New Money
            _Shipment.Details.CashAdditionalAmount.Value = Convert.ToDouble(nudShipmentDetailsCashAdditionalValue.Value)
            _Shipment.Details.CashAdditionalAmount.CurrencyCode = txtShipmentDetailsCashAdditionalCurrency.Text.Trim()
        End If
        _Shipment.Details.CashAdditionalAmountDescription = txtShipmentDetailsCashAdditionalDescription.Text.Trim()
        If (nudShipmentDetailsCustomsValue.Value > 0 AndAlso Not String.IsNullOrEmpty(txtShipmentDetailsCustomsCurrency.Text)) Then
            _Shipment.Details.CustomsValueAmount = New Money
            _Shipment.Details.CustomsValueAmount.Value = Convert.ToDouble(nudShipmentDetailsCustomsValue.Value)
            _Shipment.Details.CustomsValueAmount.CurrencyCode = txtShipmentDetailsCustomsCurrency.Text.Trim()
        End If

        If (_Items IsNot Nothing) Then _Shipment.Details.Items = _Items.ToArray()

        If (_Shipments Is Nothing) Then _Shipments = New List(Of Shipment)
        _Shipments.Add(_Shipment)
        FillShipments()
        ClearShipment()
    End Sub

    Private Sub btnRemoveShipment_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnRemoveShipment.Click
        If (_Shipments IsNot Nothing AndAlso _Shipments.Count > 0) Then
            If (lbShipments.SelectedIndex <> -1) Then
                _Shipments.RemoveAt(lbShipments.SelectedIndex)
                FillShipments()
            End If
        End If
    End Sub

    Private Sub lbShipments_DoubleClick(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles lbShipments.DoubleClick
        Cursor.Current = Cursors.WaitCursor

        _Shipment = _Shipments.Item(lbShipments.SelectedIndex)
        _Shipments.RemoveAt(lbShipments.SelectedIndex)
        lbShipments.Items.RemoveAt(lbShipments.SelectedIndex)

        'Shipper
        txtShipperReference1.Text = _Shipment.Shipper.Reference1
        txtShipperReference2.Text = _Shipment.Shipper.Reference2
        txtShipperAccountNumber.Text = _Shipment.Shipper.AccountNumber

        txtShipperAddressLine1.Text = _Shipment.Shipper.PartyAddress.Line1
        txtShipperAddressLine2.Text = _Shipment.Shipper.PartyAddress.Line2
        txtShipperAddressLine3.Text = _Shipment.Shipper.PartyAddress.Line3
        txtShipperAddressCity.Text = _Shipment.Shipper.PartyAddress.City
        txtShipperAddressState.Text = _Shipment.Shipper.PartyAddress.StateOrProvinceCode
        txtShipperAddressPostCode.Text = _Shipment.Shipper.PartyAddress.PostCode
        txtShipperAddressCountry.Text = _Shipment.Shipper.PartyAddress.CountryCode

        txtShipperContactDepartment.Text = _Shipment.Shipper.Contact.Department
        txtShipperContactPersonName.Text = _Shipment.Shipper.Contact.PersonName
        txtShipperContactTitle.Text = _Shipment.Shipper.Contact.Title
        txtShipperContactCompanyName.Text = _Shipment.Shipper.Contact.CompanyName
        txtShipperContactPhoneNumber1.Text = _Shipment.Shipper.Contact.PhoneNumber1
        txtShipperContactPhoneNumber1Ext.Text = _Shipment.Shipper.Contact.PhoneNumber1Ext
        txtShipperContactPhoneNumber2.Text = _Shipment.Shipper.Contact.PhoneNumber2
        txtShipperContactPhoneNumber2Ext.Text = _Shipment.Shipper.Contact.PhoneNumber2Ext
        txtShipperContactFaxNumber.Text = _Shipment.Shipper.Contact.FaxNumber
        txtShipperContactCellPhone.Text = _Shipment.Shipper.Contact.CellPhone
        txtShipperContactEmailAddress.Text = _Shipment.Shipper.Contact.EmailAddress
        txtShipperContactType.Text = _Shipment.Shipper.Contact.Type

        'Recipient
        txtRecipientReference1.Text = _Shipment.Consignee.Reference1
        txtRecipientReference2.Text = _Shipment.Consignee.Reference2
        txtRecipientAccountNumber.Text = _Shipment.Consignee.AccountNumber

        txtRecipientAddressLine1.Text = _Shipment.Consignee.PartyAddress.Line1
        txtRecipientAddressLine2.Text = _Shipment.Consignee.PartyAddress.Line2
        txtRecipientAddressLine3.Text = _Shipment.Consignee.PartyAddress.Line3
        txtRecipientAddressCity.Text = _Shipment.Consignee.PartyAddress.City
        txtRecipientAddressState.Text = _Shipment.Consignee.PartyAddress.StateOrProvinceCode
        txtRecipientAddressPostCode.Text = _Shipment.Consignee.PartyAddress.PostCode
        txtRecipientAddressCountry.Text = _Shipment.Consignee.PartyAddress.CountryCode

        txtRecipientContactDepartment.Text = _Shipment.Consignee.Contact.Department
        txtRecipientContactPersonName.Text = _Shipment.Consignee.Contact.PersonName
        txtRecipientContactTitle.Text = _Shipment.Consignee.Contact.Title
        txtRecipientContactCompanyName.Text = _Shipment.Consignee.Contact.CompanyName
        txtRecipientContactPhoneNumber1.Text = _Shipment.Consignee.Contact.PhoneNumber1
        txtRecipientContactPhoneNumber1Ext.Text = _Shipment.Consignee.Contact.PhoneNumber1Ext
        txtRecipientContactPhoneNumber2.Text = _Shipment.Consignee.Contact.PhoneNumber2
        txtRecipientContactPhoneNumber2Ext.Text = _Shipment.Consignee.Contact.PhoneNumber2Ext
        txtRecipientContactFaxNumber.Text = _Shipment.Consignee.Contact.FaxNumber
        txtRecipientContactCellPhone.Text = _Shipment.Consignee.Contact.CellPhone
        txtRecipientContactEmailAddress.Text = _Shipment.Consignee.Contact.EmailAddress
        txtRecipientContactType.Text = _Shipment.Consignee.Contact.Type

        'ThirdParty
        txtThirdPartyReference1.Text = _Shipment.ThirdParty.Reference1
        txtThirdPartyReference2.Text = _Shipment.ThirdParty.Reference2
        txtThirdPartyAccountNumber.Text = _Shipment.ThirdParty.AccountNumber

        txtThirdPartyAddressLine1.Text = _Shipment.ThirdParty.PartyAddress.Line1
        txtThirdPartyAddressLine2.Text = _Shipment.ThirdParty.PartyAddress.Line2
        txtThirdPartyAddressLine3.Text = _Shipment.ThirdParty.PartyAddress.Line3
        txtThirdPartyAddressCity.Text = _Shipment.ThirdParty.PartyAddress.City
        txtThirdPartyAddressState.Text = _Shipment.ThirdParty.PartyAddress.StateOrProvinceCode
        txtThirdPartyAddressPostCode.Text = _Shipment.ThirdParty.PartyAddress.PostCode
        txtThirdPartyAddressCountry.Text = _Shipment.ThirdParty.PartyAddress.CountryCode

        txtThirdPartyContactDepartment.Text = _Shipment.ThirdParty.Contact.Department
        txtThirdPartyContactPersonName.Text = _Shipment.ThirdParty.Contact.PersonName
        txtThirdPartyContactTitle.Text = _Shipment.ThirdParty.Contact.Title
        txtThirdPartyContactCompanyName.Text = _Shipment.ThirdParty.Contact.CompanyName
        txtThirdPartyContactPhoneNumber1.Text = _Shipment.ThirdParty.Contact.PhoneNumber1
        txtThirdPartyContactPhoneNumber1Ext.Text = _Shipment.ThirdParty.Contact.PhoneNumber1Ext
        txtThirdPartyContactPhoneNumber2.Text = _Shipment.ThirdParty.Contact.PhoneNumber2
        txtThirdPartyContactPhoneNumber2Ext.Text = _Shipment.ThirdParty.Contact.PhoneNumber2Ext
        txtThirdPartyContactFaxNumber.Text = _Shipment.ThirdParty.Contact.FaxNumber
        txtThirdPartyContactCellPhone.Text = _Shipment.ThirdParty.Contact.CellPhone
        txtThirdPartyContactEmailAddress.Text = _Shipment.ThirdParty.Contact.EmailAddress
        txtThirdPartyContactType.Text = _Shipment.ThirdParty.Contact.Type

        'Main
        txtShipmentReference1.Text = _Shipment.Reference1
        txtShipmentReference2.Text = _Shipment.Reference2
        txtShipmentReference3.Text = _Shipment.Reference3
        txtForeignHAWB.Text = _Shipment.ForeignHAWB
        nudShipmentTransportType.Value = _Shipment.TransportType

        dtpShipmentShippingDate.Value = _Shipment.ShippingDateTime
        dtpShipmentShippingDueDate.Value = _Shipment.DueDate

        If (_Attachments IsNot Nothing) Then
            _Attachments = _Shipment.Attachments.ToList()
            FillAttachments()
        End If

        txtShipmentPickupLocation.Text = _Shipment.PickupLocation
        txtShipmentComments.Text = _Shipment.Comments
        txtShipmentAccountingInstructions.Text = _Shipment.AccountingInstrcutions
        txtShipmentOperationsInstructions.Text = _Shipment.OperationsInstructions

        'Details
        nudShipmentDetailsDimensionsLength.Value = _Shipment.Details.Dimensions.Length
        nudShipmentDetailsDimensionsWidth.Value = _Shipment.Details.Dimensions.Width
        nudShipmentDetailsDimensionsHeight.Value = _Shipment.Details.Dimensions.Height
        cmbShipmentDetailsDimensionsUnit.Text = _Shipment.Details.Dimensions.Unit

        If (_Shipment.Details.ActualWeight IsNot Nothing) Then
            nudShipmentDetailsActualWeightValue.Value = _Shipment.Details.ActualWeight.Value
            cmbShipmentDetailsActualWeightUnit.Text = _Shipment.Details.ActualWeight.Unit
        End If

        txtShipmentDetailsProductGroup.Text = _Shipment.Details.ProductGroup
        txtShipmentDetailsProductType.Text = _Shipment.Details.ProductType
        txtShipmentDetailsPaymentType.Text = _Shipment.Details.PaymentType
        txtShipmentDetailsPaymentOptions.Text = _Shipment.Details.PaymentOptions
        txtShipmentDetailsServices.Text = _Shipment.Details.Services
        nudShipmentDetailsNumberOfPieces.Value = _Shipment.Details.NumberOfPieces
        txtShipmentDetailsDescriptionOfGoods.Text = _Shipment.Details.DescriptionOfGoods
        txtShipmentDetailsGoodsOrigin.Text = _Shipment.Details.GoodsOriginCountry

        If (_Shipment.Details.CashOnDeliveryAmount IsNot Nothing) Then
            nudShipmentDetailsCashOnDeliveryAmountValue.Value = _Shipment.Details.CashOnDeliveryAmount.Value
            txtShipmentDetailsCashOnDeliveryAmountCurrency.Text = _Shipment.Details.CashOnDeliveryAmount.CurrencyCode
        End If
        If (_Shipment.Details.InsuranceAmount IsNot Nothing) Then
            nudShipmentDetailsInsuranceValue.Value = _Shipment.Details.InsuranceAmount.Value
            txtShipmentDetailsInsuranceCurrency.Text = _Shipment.Details.InsuranceAmount.CurrencyCode
        End If
        If (_Shipment.Details.CollectAmount IsNot Nothing) Then
            nudShipmentDetailsCollectValue.Value = _Shipment.Details.CollectAmount.Value
            txtShipmentDetailsCollectCurrency.Text = _Shipment.Details.CollectAmount.CurrencyCode
        End If
        If (_Shipment.Details.CashAdditionalAmount IsNot Nothing) Then
            nudShipmentDetailsCashAdditionalValue.Value = _Shipment.Details.CashAdditionalAmount.Value
            txtShipmentDetailsCashAdditionalCurrency.Text = _Shipment.Details.CashAdditionalAmount.CurrencyCode
        End If
        txtShipmentDetailsCashAdditionalDescription.Text = _Shipment.Details.CashAdditionalAmountDescription
        If (_Shipment.Details.CustomsValueAmount IsNot Nothing) Then
            nudShipmentDetailsCustomsValue.Value = _Shipment.Details.CustomsValueAmount.Value
            txtShipmentDetailsCustomsCurrency.Text = _Shipment.Details.CustomsValueAmount.CurrencyCode
        End If

        If (_Shipment.Details.Items IsNot Nothing) Then
            _Items = _Shipment.Details.Items.ToList()
            FillItems()
        End If

        Cursor.Current = Cursors.Default
    End Sub

    Private Sub btnExit_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnExit.Click
        Me.Close()
    End Sub

    Private Sub btnOK_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOK.Click
        Me.DialogResult = DialogResult.OK
        Me.Close()
    End Sub
#End Region

End Class