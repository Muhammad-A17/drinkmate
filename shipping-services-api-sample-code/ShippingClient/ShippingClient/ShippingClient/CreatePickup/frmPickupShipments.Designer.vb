<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmPickupShipments
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.gcShipment = New System.Windows.Forms.GroupBox()
        Me.SplitContainer1 = New System.Windows.Forms.SplitContainer()
        Me.tcShipment = New System.Windows.Forms.TabControl()
        Me.tpShipper = New System.Windows.Forms.TabPage()
        Me.gcShipperContact = New System.Windows.Forms.GroupBox()
        Me.lblShipperContactType = New System.Windows.Forms.Label()
        Me.lblShipperContactEmailAddress = New System.Windows.Forms.Label()
        Me.lblShipperContactCellPhone = New System.Windows.Forms.Label()
        Me.lblShipperContactFaxNumber = New System.Windows.Forms.Label()
        Me.lblShipperContactPhoneNumber2 = New System.Windows.Forms.Label()
        Me.lblShipperContactPhoneNumber1 = New System.Windows.Forms.Label()
        Me.lblShipperContactCompanyName = New System.Windows.Forms.Label()
        Me.lblShipperContactTitle = New System.Windows.Forms.Label()
        Me.lblShipperContactPersonName = New System.Windows.Forms.Label()
        Me.lblShipperContactDepartment = New System.Windows.Forms.Label()
        Me.txtShipperContactType = New System.Windows.Forms.TextBox()
        Me.txtShipperContactEmailAddress = New System.Windows.Forms.TextBox()
        Me.txtShipperContactCellPhone = New System.Windows.Forms.TextBox()
        Me.txtShipperContactFaxNumber = New System.Windows.Forms.TextBox()
        Me.txtShipperContactPhoneNumber2Ext = New System.Windows.Forms.TextBox()
        Me.txtShipperContactPhoneNumber2 = New System.Windows.Forms.TextBox()
        Me.txtShipperContactPhoneNumber1Ext = New System.Windows.Forms.TextBox()
        Me.txtShipperContactPhoneNumber1 = New System.Windows.Forms.TextBox()
        Me.txtShipperContactCompanyName = New System.Windows.Forms.TextBox()
        Me.txtShipperContactTitle = New System.Windows.Forms.TextBox()
        Me.txtShipperContactPersonName = New System.Windows.Forms.TextBox()
        Me.txtShipperContactDepartment = New System.Windows.Forms.TextBox()
        Me.gcShipperAddress = New System.Windows.Forms.GroupBox()
        Me.lblShipperAddressCountry = New System.Windows.Forms.Label()
        Me.lblShipperAddressPostCode = New System.Windows.Forms.Label()
        Me.lblShipperAddressState = New System.Windows.Forms.Label()
        Me.lblShipperAddressCity = New System.Windows.Forms.Label()
        Me.lblShipperAddressLine3 = New System.Windows.Forms.Label()
        Me.lblShipperAddressLine2 = New System.Windows.Forms.Label()
        Me.lblShipperAddressLine1 = New System.Windows.Forms.Label()
        Me.txtShipperAddressCountry = New System.Windows.Forms.TextBox()
        Me.txtShipperAddressPostCode = New System.Windows.Forms.TextBox()
        Me.txtShipperAddressState = New System.Windows.Forms.TextBox()
        Me.txtShipperAddressCity = New System.Windows.Forms.TextBox()
        Me.txtShipperAddressLine3 = New System.Windows.Forms.TextBox()
        Me.txtShipperAddressLine2 = New System.Windows.Forms.TextBox()
        Me.txtShipperAddressLine1 = New System.Windows.Forms.TextBox()
        Me.gcShipperReferences = New System.Windows.Forms.GroupBox()
        Me.lblShipperAccountNumber = New System.Windows.Forms.Label()
        Me.lblShipperReference2 = New System.Windows.Forms.Label()
        Me.lblShipperReference1 = New System.Windows.Forms.Label()
        Me.txtShipperAccountNumber = New System.Windows.Forms.TextBox()
        Me.txtShipperReference2 = New System.Windows.Forms.TextBox()
        Me.txtShipperReference1 = New System.Windows.Forms.TextBox()
        Me.tpRecipient = New System.Windows.Forms.TabPage()
        Me.gcRecipientContact = New System.Windows.Forms.GroupBox()
        Me.lblRecipientContactType = New System.Windows.Forms.Label()
        Me.lblRecipientContactEmailAddress = New System.Windows.Forms.Label()
        Me.lblRecipientContactCellPhone = New System.Windows.Forms.Label()
        Me.lblRecipientContactFaxNumber = New System.Windows.Forms.Label()
        Me.lblRecipientContactPhoneNumber2 = New System.Windows.Forms.Label()
        Me.lblRecipientContactPhoneNumber1 = New System.Windows.Forms.Label()
        Me.lblRecipientContactCompanyName = New System.Windows.Forms.Label()
        Me.lblRecipientContactTitle = New System.Windows.Forms.Label()
        Me.lblRecipientContactPersonName = New System.Windows.Forms.Label()
        Me.lblRecipientContactDepartment = New System.Windows.Forms.Label()
        Me.txtRecipientContactType = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactEmailAddress = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactCellPhone = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactFaxNumber = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactPhoneNumber2Ext = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactPhoneNumber2 = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactPhoneNumber1Ext = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactPhoneNumber1 = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactCompanyName = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactTitle = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactPersonName = New System.Windows.Forms.TextBox()
        Me.txtRecipientContactDepartment = New System.Windows.Forms.TextBox()
        Me.gcRecipientAddress = New System.Windows.Forms.GroupBox()
        Me.lblRecipientAddressCountry = New System.Windows.Forms.Label()
        Me.lblRecipientAddressPostCode = New System.Windows.Forms.Label()
        Me.lblRecipientAddressState = New System.Windows.Forms.Label()
        Me.lblRecipientAddressCity = New System.Windows.Forms.Label()
        Me.lblRecipientAddressLine3 = New System.Windows.Forms.Label()
        Me.lblRecipientAddressLine2 = New System.Windows.Forms.Label()
        Me.lblRecipientAddressLine1 = New System.Windows.Forms.Label()
        Me.txtRecipientAddressCountry = New System.Windows.Forms.TextBox()
        Me.txtRecipientAddressPostCode = New System.Windows.Forms.TextBox()
        Me.txtRecipientAddressState = New System.Windows.Forms.TextBox()
        Me.txtRecipientAddressCity = New System.Windows.Forms.TextBox()
        Me.txtRecipientAddressLine3 = New System.Windows.Forms.TextBox()
        Me.txtRecipientAddressLine2 = New System.Windows.Forms.TextBox()
        Me.txtRecipientAddressLine1 = New System.Windows.Forms.TextBox()
        Me.gcRecipientReferences = New System.Windows.Forms.GroupBox()
        Me.lblRecipientAccountNumber = New System.Windows.Forms.Label()
        Me.lblRecipientReference2 = New System.Windows.Forms.Label()
        Me.lblRecipientReference1 = New System.Windows.Forms.Label()
        Me.txtRecipientAccountNumber = New System.Windows.Forms.TextBox()
        Me.txtRecipientReference2 = New System.Windows.Forms.TextBox()
        Me.txtRecipientReference1 = New System.Windows.Forms.TextBox()
        Me.tpThirdParty = New System.Windows.Forms.TabPage()
        Me.gcThirdPartyContact = New System.Windows.Forms.GroupBox()
        Me.lblThirdPartyContactType = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactEmailAddress = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactCellPhone = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactFaxNumber = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactPhoneNumber2 = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactPhoneNumber1 = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactCompanyName = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactTitle = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactPersonName = New System.Windows.Forms.Label()
        Me.lblThirdPartyContactDepartment = New System.Windows.Forms.Label()
        Me.txtThirdPartyContactType = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactEmailAddress = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactCellPhone = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactFaxNumber = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactPhoneNumber2Ext = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactPhoneNumber2 = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactPhoneNumber1Ext = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactPhoneNumber1 = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactCompanyName = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactTitle = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactPersonName = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyContactDepartment = New System.Windows.Forms.TextBox()
        Me.gcThirdPartyAddress = New System.Windows.Forms.GroupBox()
        Me.lblThirdPartyAddressCountry = New System.Windows.Forms.Label()
        Me.lblThirdPartyAddressPostCode = New System.Windows.Forms.Label()
        Me.lblThirdPartyAddressState = New System.Windows.Forms.Label()
        Me.lblThirdPartyAddressCity = New System.Windows.Forms.Label()
        Me.lblThirdPartyAddressLine3 = New System.Windows.Forms.Label()
        Me.lblThirdPartyAddressLine2 = New System.Windows.Forms.Label()
        Me.lblThirdPartyAddressLine1 = New System.Windows.Forms.Label()
        Me.txtThirdPartyAddressCountry = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyAddressPostCode = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyAddressState = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyAddressCity = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyAddressLine3 = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyAddressLine2 = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyAddressLine1 = New System.Windows.Forms.TextBox()
        Me.gcThirdPartyReferences = New System.Windows.Forms.GroupBox()
        Me.lblThirdPartyAccountNumber = New System.Windows.Forms.Label()
        Me.lblThirdPartyReference2 = New System.Windows.Forms.Label()
        Me.lblThirdPartyReference1 = New System.Windows.Forms.Label()
        Me.txtThirdPartyAccountNumber = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyReference2 = New System.Windows.Forms.TextBox()
        Me.txtThirdPartyReference1 = New System.Windows.Forms.TextBox()
        Me.tpMain = New System.Windows.Forms.TabPage()
        Me.gcShipmentAttachments = New System.Windows.Forms.GroupBox()
        Me.btnRemoveAttachment = New System.Windows.Forms.Button()
        Me.btnAddAttachment = New System.Windows.Forms.Button()
        Me.lblFileName = New System.Windows.Forms.Label()
        Me.lbShipmentAttachments = New System.Windows.Forms.ListBox()
        Me.btnAttachment = New System.Windows.Forms.Button()
        Me.txtShipmentAttachment = New System.Windows.Forms.TextBox()
        Me.gcShipmentComments = New System.Windows.Forms.GroupBox()
        Me.lblShipmentOperationsInstructions = New System.Windows.Forms.Label()
        Me.lblShipmentAccountingInstructions = New System.Windows.Forms.Label()
        Me.lblShipmentComments = New System.Windows.Forms.Label()
        Me.lblShipmentPickupLocation = New System.Windows.Forms.Label()
        Me.txtShipmentPickupLocation = New System.Windows.Forms.TextBox()
        Me.txtShipmentOperationsInstructions = New System.Windows.Forms.TextBox()
        Me.txtShipmentAccountingInstructions = New System.Windows.Forms.TextBox()
        Me.txtShipmentComments = New System.Windows.Forms.TextBox()
        Me.gcShipmentDates = New System.Windows.Forms.GroupBox()
        Me.lblShipmentShippingDueDate = New System.Windows.Forms.Label()
        Me.lblShipmentShippingDate = New System.Windows.Forms.Label()
        Me.dtpShipmentShippingDueDate = New System.Windows.Forms.DateTimePicker()
        Me.dtpShipmentShippingDate = New System.Windows.Forms.DateTimePicker()
        Me.gcShipmentReferences = New System.Windows.Forms.GroupBox()
        Me.lblShipmentTransportType = New System.Windows.Forms.Label()
        Me.nudShipmentTransportType = New System.Windows.Forms.NumericUpDown()
        Me.lblForeignHAWB = New System.Windows.Forms.Label()
        Me.txtForeignHAWB = New System.Windows.Forms.TextBox()
        Me.lblShipmentReference3 = New System.Windows.Forms.Label()
        Me.lblShipmentReference2 = New System.Windows.Forms.Label()
        Me.lblShipmentReference1 = New System.Windows.Forms.Label()
        Me.txtShipmentReference3 = New System.Windows.Forms.TextBox()
        Me.txtShipmentReference2 = New System.Windows.Forms.TextBox()
        Me.txtShipmentReference1 = New System.Windows.Forms.TextBox()
        Me.tpDetails = New System.Windows.Forms.TabPage()
        Me.gcShipmentDetailsItems = New System.Windows.Forms.GroupBox()
        Me.lvItems = New System.Windows.Forms.ListView()
        Me.colPackage = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.colQuantity = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.colWeight = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.colComments = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.colReference = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.lblShipmentDetailsItemReference = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsItemComments = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsItemWeight = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsItemQuantity = New System.Windows.Forms.Label()
        Me.btnRemoveItem = New System.Windows.Forms.Button()
        Me.btnAddItem = New System.Windows.Forms.Button()
        Me.txtShipmentDetailsItemReference = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsItemComments = New System.Windows.Forms.TextBox()
        Me.cmbShipmentDetailsItemWeightUnit = New System.Windows.Forms.ComboBox()
        Me.nudShipmentDetailsItemWeightValue = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsItemQuantity = New System.Windows.Forms.NumericUpDown()
        Me.txtShipmentDetailsItemPackageType = New System.Windows.Forms.TextBox()
        Me.lblShipmentDetailsItemPackageType = New System.Windows.Forms.Label()
        Me.gcShipmentDetailsAmounts = New System.Windows.Forms.GroupBox()
        Me.lblShipmentDetailsCashAdditionalDescription = New System.Windows.Forms.Label()
        Me.txtShipmentDetailsCashAdditionalDescription = New System.Windows.Forms.TextBox()
        Me.nudShipmentDetailsCustomsValue = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsCashAdditionalValue = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsCollectValue = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsInsuranceValue = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsCashOnDeliveryAmountValue = New System.Windows.Forms.NumericUpDown()
        Me.lblShipmentDetailsCustomsValue = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsCashAdditionalValue = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsCollectValue = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsInsuranceValue = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsCashOnDeliveryAmountValue = New System.Windows.Forms.Label()
        Me.txtShipmentDetailsCustomsCurrency = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsCashAdditionalCurrency = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsCollectCurrency = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsInsuranceCurrency = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsCashOnDeliveryAmountCurrency = New System.Windows.Forms.TextBox()
        Me.gcShipmentDetailsTypes = New System.Windows.Forms.GroupBox()
        Me.lblShipmentDetailsGoodsOrigin = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsDescriptionOfGoods = New System.Windows.Forms.Label()
        Me.txtShipmentDetailsGoodsOrigin = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsDescriptionOfGoods = New System.Windows.Forms.TextBox()
        Me.lblShipmentDetailsNumberOfPieces = New System.Windows.Forms.Label()
        Me.nudShipmentDetailsNumberOfPieces = New System.Windows.Forms.NumericUpDown()
        Me.lblShipmentDetailsServices = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsPaymentOptions = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsPaymentType = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsProductType = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsProductGroup = New System.Windows.Forms.Label()
        Me.txtShipmentDetailsServices = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsPaymentOptions = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsPaymentType = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsProductType = New System.Windows.Forms.TextBox()
        Me.txtShipmentDetailsProductGroup = New System.Windows.Forms.TextBox()
        Me.gcShipmentDetailsWeights = New System.Windows.Forms.GroupBox()
        Me.lblShipmentDetailsActualWeightValue = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsActualWeightUnit = New System.Windows.Forms.Label()
        Me.cmbShipmentDetailsActualWeightUnit = New System.Windows.Forms.ComboBox()
        Me.nudShipmentDetailsActualWeightValue = New System.Windows.Forms.NumericUpDown()
        Me.gcShipmentDetailsDimensions = New System.Windows.Forms.GroupBox()
        Me.lblShipmentDetailsDimensionsUnit = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsDimensionsWidth = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsDimensionsHeight = New System.Windows.Forms.Label()
        Me.lblShipmentDetailsDimensionsLength = New System.Windows.Forms.Label()
        Me.cmbShipmentDetailsDimensionsUnit = New System.Windows.Forms.ComboBox()
        Me.nudShipmentDetailsDimensionsWidth = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsDimensionsHeight = New System.Windows.Forms.NumericUpDown()
        Me.nudShipmentDetailsDimensionsLength = New System.Windows.Forms.NumericUpDown()
        Me.TableLayoutPanel1 = New System.Windows.Forms.TableLayoutPanel()
        Me.TableLayoutPanel2 = New System.Windows.Forms.TableLayoutPanel()
        Me.btnRemoveShipment = New System.Windows.Forms.Button()
        Me.btnAddShipment = New System.Windows.Forms.Button()
        Me.lbShipments = New System.Windows.Forms.ListBox()
        Me.btnOK = New System.Windows.Forms.Button()
        Me.btnExit = New System.Windows.Forms.Button()
        Me.ofgAttachment = New System.Windows.Forms.OpenFileDialog()
        Me.gcShipment.SuspendLayout()
        CType(Me.SplitContainer1, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SplitContainer1.Panel1.SuspendLayout()
        Me.SplitContainer1.Panel2.SuspendLayout()
        Me.SplitContainer1.SuspendLayout()
        Me.tcShipment.SuspendLayout()
        Me.tpShipper.SuspendLayout()
        Me.gcShipperContact.SuspendLayout()
        Me.gcShipperAddress.SuspendLayout()
        Me.gcShipperReferences.SuspendLayout()
        Me.tpRecipient.SuspendLayout()
        Me.gcRecipientContact.SuspendLayout()
        Me.gcRecipientAddress.SuspendLayout()
        Me.gcRecipientReferences.SuspendLayout()
        Me.tpThirdParty.SuspendLayout()
        Me.gcThirdPartyContact.SuspendLayout()
        Me.gcThirdPartyAddress.SuspendLayout()
        Me.gcThirdPartyReferences.SuspendLayout()
        Me.tpMain.SuspendLayout()
        Me.gcShipmentAttachments.SuspendLayout()
        Me.gcShipmentComments.SuspendLayout()
        Me.gcShipmentDates.SuspendLayout()
        Me.gcShipmentReferences.SuspendLayout()
        CType(Me.nudShipmentTransportType, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.tpDetails.SuspendLayout()
        Me.gcShipmentDetailsItems.SuspendLayout()
        CType(Me.nudShipmentDetailsItemWeightValue, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsItemQuantity, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.gcShipmentDetailsAmounts.SuspendLayout()
        CType(Me.nudShipmentDetailsCustomsValue, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsCashAdditionalValue, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsCollectValue, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsInsuranceValue, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsCashOnDeliveryAmountValue, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.gcShipmentDetailsTypes.SuspendLayout()
        CType(Me.nudShipmentDetailsNumberOfPieces, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.gcShipmentDetailsWeights.SuspendLayout()
        CType(Me.nudShipmentDetailsActualWeightValue, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.gcShipmentDetailsDimensions.SuspendLayout()
        CType(Me.nudShipmentDetailsDimensionsWidth, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsDimensionsHeight, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.nudShipmentDetailsDimensionsLength, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.TableLayoutPanel1.SuspendLayout()
        Me.TableLayoutPanel2.SuspendLayout()
        Me.SuspendLayout()
        '
        'gcShipment
        '
        Me.gcShipment.Controls.Add(Me.SplitContainer1)
        Me.gcShipment.Location = New System.Drawing.Point(12, 12)
        Me.gcShipment.Name = "gcShipment"
        Me.gcShipment.Size = New System.Drawing.Size(952, 433)
        Me.gcShipment.TabIndex = 0
        Me.gcShipment.TabStop = False
        Me.gcShipment.Text = "Shipment"
        '
        'SplitContainer1
        '
        Me.SplitContainer1.Dock = System.Windows.Forms.DockStyle.Fill
        Me.SplitContainer1.Location = New System.Drawing.Point(3, 16)
        Me.SplitContainer1.Name = "SplitContainer1"
        '
        'SplitContainer1.Panel1
        '
        Me.SplitContainer1.Panel1.Controls.Add(Me.tcShipment)
        '
        'SplitContainer1.Panel2
        '
        Me.SplitContainer1.Panel2.Controls.Add(Me.TableLayoutPanel1)
        Me.SplitContainer1.Size = New System.Drawing.Size(946, 414)
        Me.SplitContainer1.SplitterDistance = 744
        Me.SplitContainer1.TabIndex = 0
        '
        'tcShipment
        '
        Me.tcShipment.Controls.Add(Me.tpShipper)
        Me.tcShipment.Controls.Add(Me.tpRecipient)
        Me.tcShipment.Controls.Add(Me.tpThirdParty)
        Me.tcShipment.Controls.Add(Me.tpMain)
        Me.tcShipment.Controls.Add(Me.tpDetails)
        Me.tcShipment.Dock = System.Windows.Forms.DockStyle.Fill
        Me.tcShipment.Location = New System.Drawing.Point(0, 0)
        Me.tcShipment.Name = "tcShipment"
        Me.tcShipment.SelectedIndex = 0
        Me.tcShipment.Size = New System.Drawing.Size(744, 414)
        Me.tcShipment.TabIndex = 0
        '
        'tpShipper
        '
        Me.tpShipper.Controls.Add(Me.gcShipperContact)
        Me.tpShipper.Controls.Add(Me.gcShipperAddress)
        Me.tpShipper.Controls.Add(Me.gcShipperReferences)
        Me.tpShipper.Location = New System.Drawing.Point(4, 22)
        Me.tpShipper.Name = "tpShipper"
        Me.tpShipper.Padding = New System.Windows.Forms.Padding(3)
        Me.tpShipper.Size = New System.Drawing.Size(736, 388)
        Me.tpShipper.TabIndex = 0
        Me.tpShipper.Text = "Shipper"
        Me.tpShipper.UseVisualStyleBackColor = True
        '
        'gcShipperContact
        '
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactType)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactEmailAddress)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactCellPhone)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactFaxNumber)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactPhoneNumber2)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactPhoneNumber1)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactCompanyName)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactTitle)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactPersonName)
        Me.gcShipperContact.Controls.Add(Me.lblShipperContactDepartment)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactType)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactEmailAddress)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactCellPhone)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactFaxNumber)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactPhoneNumber2Ext)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactPhoneNumber2)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactPhoneNumber1Ext)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactPhoneNumber1)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactCompanyName)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactTitle)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactPersonName)
        Me.gcShipperContact.Controls.Add(Me.txtShipperContactDepartment)
        Me.gcShipperContact.Location = New System.Drawing.Point(338, 6)
        Me.gcShipperContact.Name = "gcShipperContact"
        Me.gcShipperContact.Size = New System.Drawing.Size(381, 376)
        Me.gcShipperContact.TabIndex = 2
        Me.gcShipperContact.TabStop = False
        Me.gcShipperContact.Text = "Contact"
        '
        'lblShipperContactType
        '
        Me.lblShipperContactType.AutoSize = True
        Me.lblShipperContactType.Location = New System.Drawing.Point(6, 257)
        Me.lblShipperContactType.Name = "lblShipperContactType"
        Me.lblShipperContactType.Size = New System.Drawing.Size(34, 13)
        Me.lblShipperContactType.TabIndex = 20
        Me.lblShipperContactType.Text = "Type:"
        '
        'lblShipperContactEmailAddress
        '
        Me.lblShipperContactEmailAddress.AutoSize = True
        Me.lblShipperContactEmailAddress.Location = New System.Drawing.Point(6, 231)
        Me.lblShipperContactEmailAddress.Name = "lblShipperContactEmailAddress"
        Me.lblShipperContactEmailAddress.Size = New System.Drawing.Size(76, 13)
        Me.lblShipperContactEmailAddress.TabIndex = 18
        Me.lblShipperContactEmailAddress.Text = "Email Address:"
        '
        'lblShipperContactCellPhone
        '
        Me.lblShipperContactCellPhone.AutoSize = True
        Me.lblShipperContactCellPhone.Location = New System.Drawing.Point(6, 205)
        Me.lblShipperContactCellPhone.Name = "lblShipperContactCellPhone"
        Me.lblShipperContactCellPhone.Size = New System.Drawing.Size(61, 13)
        Me.lblShipperContactCellPhone.TabIndex = 16
        Me.lblShipperContactCellPhone.Text = "Cell Phone:"
        '
        'lblShipperContactFaxNumber
        '
        Me.lblShipperContactFaxNumber.AutoSize = True
        Me.lblShipperContactFaxNumber.Location = New System.Drawing.Point(6, 179)
        Me.lblShipperContactFaxNumber.Name = "lblShipperContactFaxNumber"
        Me.lblShipperContactFaxNumber.Size = New System.Drawing.Size(67, 13)
        Me.lblShipperContactFaxNumber.TabIndex = 14
        Me.lblShipperContactFaxNumber.Text = "Fax Number:"
        '
        'lblShipperContactPhoneNumber2
        '
        Me.lblShipperContactPhoneNumber2.AutoSize = True
        Me.lblShipperContactPhoneNumber2.Location = New System.Drawing.Point(6, 153)
        Me.lblShipperContactPhoneNumber2.Name = "lblShipperContactPhoneNumber2"
        Me.lblShipperContactPhoneNumber2.Size = New System.Drawing.Size(87, 13)
        Me.lblShipperContactPhoneNumber2.TabIndex = 11
        Me.lblShipperContactPhoneNumber2.Text = "Phone Number2:"
        '
        'lblShipperContactPhoneNumber1
        '
        Me.lblShipperContactPhoneNumber1.AutoSize = True
        Me.lblShipperContactPhoneNumber1.Location = New System.Drawing.Point(6, 127)
        Me.lblShipperContactPhoneNumber1.Name = "lblShipperContactPhoneNumber1"
        Me.lblShipperContactPhoneNumber1.Size = New System.Drawing.Size(87, 13)
        Me.lblShipperContactPhoneNumber1.TabIndex = 8
        Me.lblShipperContactPhoneNumber1.Text = "Phone Number1:"
        '
        'lblShipperContactCompanyName
        '
        Me.lblShipperContactCompanyName.AutoSize = True
        Me.lblShipperContactCompanyName.Location = New System.Drawing.Point(6, 101)
        Me.lblShipperContactCompanyName.Name = "lblShipperContactCompanyName"
        Me.lblShipperContactCompanyName.Size = New System.Drawing.Size(85, 13)
        Me.lblShipperContactCompanyName.TabIndex = 6
        Me.lblShipperContactCompanyName.Text = "Company Name:"
        '
        'lblShipperContactTitle
        '
        Me.lblShipperContactTitle.AutoSize = True
        Me.lblShipperContactTitle.Location = New System.Drawing.Point(6, 75)
        Me.lblShipperContactTitle.Name = "lblShipperContactTitle"
        Me.lblShipperContactTitle.Size = New System.Drawing.Size(30, 13)
        Me.lblShipperContactTitle.TabIndex = 4
        Me.lblShipperContactTitle.Text = "Title:"
        '
        'lblShipperContactPersonName
        '
        Me.lblShipperContactPersonName.AutoSize = True
        Me.lblShipperContactPersonName.Location = New System.Drawing.Point(6, 49)
        Me.lblShipperContactPersonName.Name = "lblShipperContactPersonName"
        Me.lblShipperContactPersonName.Size = New System.Drawing.Size(74, 13)
        Me.lblShipperContactPersonName.TabIndex = 2
        Me.lblShipperContactPersonName.Text = "Person Name:"
        '
        'lblShipperContactDepartment
        '
        Me.lblShipperContactDepartment.AutoSize = True
        Me.lblShipperContactDepartment.Location = New System.Drawing.Point(6, 23)
        Me.lblShipperContactDepartment.Name = "lblShipperContactDepartment"
        Me.lblShipperContactDepartment.Size = New System.Drawing.Size(65, 13)
        Me.lblShipperContactDepartment.TabIndex = 0
        Me.lblShipperContactDepartment.Text = "Department:"
        '
        'txtShipperContactType
        '
        Me.txtShipperContactType.Location = New System.Drawing.Point(100, 253)
        Me.txtShipperContactType.Name = "txtShipperContactType"
        Me.txtShipperContactType.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactType.TabIndex = 21
        '
        'txtShipperContactEmailAddress
        '
        Me.txtShipperContactEmailAddress.Location = New System.Drawing.Point(100, 227)
        Me.txtShipperContactEmailAddress.Name = "txtShipperContactEmailAddress"
        Me.txtShipperContactEmailAddress.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactEmailAddress.TabIndex = 19
        '
        'txtShipperContactCellPhone
        '
        Me.txtShipperContactCellPhone.Location = New System.Drawing.Point(100, 201)
        Me.txtShipperContactCellPhone.Name = "txtShipperContactCellPhone"
        Me.txtShipperContactCellPhone.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactCellPhone.TabIndex = 17
        '
        'txtShipperContactFaxNumber
        '
        Me.txtShipperContactFaxNumber.Location = New System.Drawing.Point(100, 175)
        Me.txtShipperContactFaxNumber.Name = "txtShipperContactFaxNumber"
        Me.txtShipperContactFaxNumber.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactFaxNumber.TabIndex = 15
        '
        'txtShipperContactPhoneNumber2Ext
        '
        Me.txtShipperContactPhoneNumber2Ext.Location = New System.Drawing.Point(319, 149)
        Me.txtShipperContactPhoneNumber2Ext.Name = "txtShipperContactPhoneNumber2Ext"
        Me.txtShipperContactPhoneNumber2Ext.Size = New System.Drawing.Size(56, 20)
        Me.txtShipperContactPhoneNumber2Ext.TabIndex = 13
        '
        'txtShipperContactPhoneNumber2
        '
        Me.txtShipperContactPhoneNumber2.Location = New System.Drawing.Point(100, 149)
        Me.txtShipperContactPhoneNumber2.Name = "txtShipperContactPhoneNumber2"
        Me.txtShipperContactPhoneNumber2.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactPhoneNumber2.TabIndex = 12
        '
        'txtShipperContactPhoneNumber1Ext
        '
        Me.txtShipperContactPhoneNumber1Ext.Location = New System.Drawing.Point(319, 123)
        Me.txtShipperContactPhoneNumber1Ext.Name = "txtShipperContactPhoneNumber1Ext"
        Me.txtShipperContactPhoneNumber1Ext.Size = New System.Drawing.Size(56, 20)
        Me.txtShipperContactPhoneNumber1Ext.TabIndex = 10
        '
        'txtShipperContactPhoneNumber1
        '
        Me.txtShipperContactPhoneNumber1.Location = New System.Drawing.Point(100, 123)
        Me.txtShipperContactPhoneNumber1.Name = "txtShipperContactPhoneNumber1"
        Me.txtShipperContactPhoneNumber1.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactPhoneNumber1.TabIndex = 9
        '
        'txtShipperContactCompanyName
        '
        Me.txtShipperContactCompanyName.Location = New System.Drawing.Point(100, 97)
        Me.txtShipperContactCompanyName.Name = "txtShipperContactCompanyName"
        Me.txtShipperContactCompanyName.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactCompanyName.TabIndex = 7
        '
        'txtShipperContactTitle
        '
        Me.txtShipperContactTitle.Location = New System.Drawing.Point(100, 71)
        Me.txtShipperContactTitle.Name = "txtShipperContactTitle"
        Me.txtShipperContactTitle.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactTitle.TabIndex = 5
        '
        'txtShipperContactPersonName
        '
        Me.txtShipperContactPersonName.Location = New System.Drawing.Point(100, 45)
        Me.txtShipperContactPersonName.Name = "txtShipperContactPersonName"
        Me.txtShipperContactPersonName.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactPersonName.TabIndex = 3
        '
        'txtShipperContactDepartment
        '
        Me.txtShipperContactDepartment.Location = New System.Drawing.Point(100, 19)
        Me.txtShipperContactDepartment.Name = "txtShipperContactDepartment"
        Me.txtShipperContactDepartment.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperContactDepartment.TabIndex = 1
        '
        'gcShipperAddress
        '
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressCountry)
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressPostCode)
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressState)
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressCity)
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressLine3)
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressLine2)
        Me.gcShipperAddress.Controls.Add(Me.lblShipperAddressLine1)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressCountry)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressPostCode)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressState)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressCity)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressLine3)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressLine2)
        Me.gcShipperAddress.Controls.Add(Me.txtShipperAddressLine1)
        Me.gcShipperAddress.Location = New System.Drawing.Point(6, 110)
        Me.gcShipperAddress.Name = "gcShipperAddress"
        Me.gcShipperAddress.Size = New System.Drawing.Size(322, 272)
        Me.gcShipperAddress.TabIndex = 1
        Me.gcShipperAddress.TabStop = False
        Me.gcShipperAddress.Text = "Address"
        '
        'lblShipperAddressCountry
        '
        Me.lblShipperAddressCountry.AutoSize = True
        Me.lblShipperAddressCountry.Location = New System.Drawing.Point(6, 179)
        Me.lblShipperAddressCountry.Name = "lblShipperAddressCountry"
        Me.lblShipperAddressCountry.Size = New System.Drawing.Size(46, 13)
        Me.lblShipperAddressCountry.TabIndex = 12
        Me.lblShipperAddressCountry.Text = "Country:"
        '
        'lblShipperAddressPostCode
        '
        Me.lblShipperAddressPostCode.AutoSize = True
        Me.lblShipperAddressPostCode.Location = New System.Drawing.Point(6, 153)
        Me.lblShipperAddressPostCode.Name = "lblShipperAddressPostCode"
        Me.lblShipperAddressPostCode.Size = New System.Drawing.Size(59, 13)
        Me.lblShipperAddressPostCode.TabIndex = 10
        Me.lblShipperAddressPostCode.Text = "Post Code:"
        '
        'lblShipperAddressState
        '
        Me.lblShipperAddressState.AutoSize = True
        Me.lblShipperAddressState.Location = New System.Drawing.Point(6, 127)
        Me.lblShipperAddressState.Name = "lblShipperAddressState"
        Me.lblShipperAddressState.Size = New System.Drawing.Size(35, 13)
        Me.lblShipperAddressState.TabIndex = 8
        Me.lblShipperAddressState.Text = "State:"
        '
        'lblShipperAddressCity
        '
        Me.lblShipperAddressCity.AutoSize = True
        Me.lblShipperAddressCity.Location = New System.Drawing.Point(6, 101)
        Me.lblShipperAddressCity.Name = "lblShipperAddressCity"
        Me.lblShipperAddressCity.Size = New System.Drawing.Size(27, 13)
        Me.lblShipperAddressCity.TabIndex = 6
        Me.lblShipperAddressCity.Text = "City:"
        '
        'lblShipperAddressLine3
        '
        Me.lblShipperAddressLine3.AutoSize = True
        Me.lblShipperAddressLine3.Location = New System.Drawing.Point(6, 75)
        Me.lblShipperAddressLine3.Name = "lblShipperAddressLine3"
        Me.lblShipperAddressLine3.Size = New System.Drawing.Size(36, 13)
        Me.lblShipperAddressLine3.TabIndex = 4
        Me.lblShipperAddressLine3.Text = "Line3:"
        '
        'lblShipperAddressLine2
        '
        Me.lblShipperAddressLine2.AutoSize = True
        Me.lblShipperAddressLine2.Location = New System.Drawing.Point(6, 49)
        Me.lblShipperAddressLine2.Name = "lblShipperAddressLine2"
        Me.lblShipperAddressLine2.Size = New System.Drawing.Size(36, 13)
        Me.lblShipperAddressLine2.TabIndex = 2
        Me.lblShipperAddressLine2.Text = "Line2:"
        '
        'lblShipperAddressLine1
        '
        Me.lblShipperAddressLine1.AutoSize = True
        Me.lblShipperAddressLine1.Location = New System.Drawing.Point(6, 23)
        Me.lblShipperAddressLine1.Name = "lblShipperAddressLine1"
        Me.lblShipperAddressLine1.Size = New System.Drawing.Size(36, 13)
        Me.lblShipperAddressLine1.TabIndex = 0
        Me.lblShipperAddressLine1.Text = "Line1:"
        '
        'txtShipperAddressCountry
        '
        Me.txtShipperAddressCountry.Location = New System.Drawing.Point(99, 175)
        Me.txtShipperAddressCountry.Name = "txtShipperAddressCountry"
        Me.txtShipperAddressCountry.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressCountry.TabIndex = 13
        '
        'txtShipperAddressPostCode
        '
        Me.txtShipperAddressPostCode.Location = New System.Drawing.Point(99, 149)
        Me.txtShipperAddressPostCode.Name = "txtShipperAddressPostCode"
        Me.txtShipperAddressPostCode.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressPostCode.TabIndex = 11
        '
        'txtShipperAddressState
        '
        Me.txtShipperAddressState.Location = New System.Drawing.Point(99, 123)
        Me.txtShipperAddressState.Name = "txtShipperAddressState"
        Me.txtShipperAddressState.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressState.TabIndex = 9
        '
        'txtShipperAddressCity
        '
        Me.txtShipperAddressCity.Location = New System.Drawing.Point(99, 97)
        Me.txtShipperAddressCity.Name = "txtShipperAddressCity"
        Me.txtShipperAddressCity.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressCity.TabIndex = 7
        '
        'txtShipperAddressLine3
        '
        Me.txtShipperAddressLine3.Location = New System.Drawing.Point(99, 71)
        Me.txtShipperAddressLine3.Name = "txtShipperAddressLine3"
        Me.txtShipperAddressLine3.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressLine3.TabIndex = 5
        '
        'txtShipperAddressLine2
        '
        Me.txtShipperAddressLine2.Location = New System.Drawing.Point(99, 45)
        Me.txtShipperAddressLine2.Name = "txtShipperAddressLine2"
        Me.txtShipperAddressLine2.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressLine2.TabIndex = 3
        '
        'txtShipperAddressLine1
        '
        Me.txtShipperAddressLine1.Location = New System.Drawing.Point(99, 19)
        Me.txtShipperAddressLine1.Name = "txtShipperAddressLine1"
        Me.txtShipperAddressLine1.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAddressLine1.TabIndex = 1
        '
        'gcShipperReferences
        '
        Me.gcShipperReferences.Controls.Add(Me.lblShipperAccountNumber)
        Me.gcShipperReferences.Controls.Add(Me.lblShipperReference2)
        Me.gcShipperReferences.Controls.Add(Me.lblShipperReference1)
        Me.gcShipperReferences.Controls.Add(Me.txtShipperAccountNumber)
        Me.gcShipperReferences.Controls.Add(Me.txtShipperReference2)
        Me.gcShipperReferences.Controls.Add(Me.txtShipperReference1)
        Me.gcShipperReferences.Location = New System.Drawing.Point(6, 6)
        Me.gcShipperReferences.Name = "gcShipperReferences"
        Me.gcShipperReferences.Size = New System.Drawing.Size(322, 98)
        Me.gcShipperReferences.TabIndex = 0
        Me.gcShipperReferences.TabStop = False
        Me.gcShipperReferences.Text = "References"
        '
        'lblShipperAccountNumber
        '
        Me.lblShipperAccountNumber.AutoSize = True
        Me.lblShipperAccountNumber.Location = New System.Drawing.Point(6, 75)
        Me.lblShipperAccountNumber.Name = "lblShipperAccountNumber"
        Me.lblShipperAccountNumber.Size = New System.Drawing.Size(72, 13)
        Me.lblShipperAccountNumber.TabIndex = 4
        Me.lblShipperAccountNumber.Text = "Acc. Number:"
        '
        'lblShipperReference2
        '
        Me.lblShipperReference2.AutoSize = True
        Me.lblShipperReference2.Location = New System.Drawing.Point(6, 49)
        Me.lblShipperReference2.Name = "lblShipperReference2"
        Me.lblShipperReference2.Size = New System.Drawing.Size(66, 13)
        Me.lblShipperReference2.TabIndex = 2
        Me.lblShipperReference2.Text = "Reference2:"
        '
        'lblShipperReference1
        '
        Me.lblShipperReference1.AutoSize = True
        Me.lblShipperReference1.Location = New System.Drawing.Point(6, 23)
        Me.lblShipperReference1.Name = "lblShipperReference1"
        Me.lblShipperReference1.Size = New System.Drawing.Size(66, 13)
        Me.lblShipperReference1.TabIndex = 0
        Me.lblShipperReference1.Text = "Reference1:"
        '
        'txtShipperAccountNumber
        '
        Me.txtShipperAccountNumber.Location = New System.Drawing.Point(99, 71)
        Me.txtShipperAccountNumber.Name = "txtShipperAccountNumber"
        Me.txtShipperAccountNumber.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperAccountNumber.TabIndex = 5
        '
        'txtShipperReference2
        '
        Me.txtShipperReference2.Location = New System.Drawing.Point(99, 45)
        Me.txtShipperReference2.Name = "txtShipperReference2"
        Me.txtShipperReference2.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperReference2.TabIndex = 3
        '
        'txtShipperReference1
        '
        Me.txtShipperReference1.Location = New System.Drawing.Point(99, 19)
        Me.txtShipperReference1.Name = "txtShipperReference1"
        Me.txtShipperReference1.Size = New System.Drawing.Size(217, 20)
        Me.txtShipperReference1.TabIndex = 1
        '
        'tpRecipient
        '
        Me.tpRecipient.Controls.Add(Me.gcRecipientContact)
        Me.tpRecipient.Controls.Add(Me.gcRecipientAddress)
        Me.tpRecipient.Controls.Add(Me.gcRecipientReferences)
        Me.tpRecipient.Location = New System.Drawing.Point(4, 22)
        Me.tpRecipient.Name = "tpRecipient"
        Me.tpRecipient.Padding = New System.Windows.Forms.Padding(3)
        Me.tpRecipient.Size = New System.Drawing.Size(736, 388)
        Me.tpRecipient.TabIndex = 1
        Me.tpRecipient.Text = "Consignee"
        Me.tpRecipient.UseVisualStyleBackColor = True
        '
        'gcRecipientContact
        '
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactType)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactEmailAddress)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactCellPhone)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactFaxNumber)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactPhoneNumber2)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactPhoneNumber1)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactCompanyName)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactTitle)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactPersonName)
        Me.gcRecipientContact.Controls.Add(Me.lblRecipientContactDepartment)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactType)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactEmailAddress)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactCellPhone)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactFaxNumber)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactPhoneNumber2Ext)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactPhoneNumber2)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactPhoneNumber1Ext)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactPhoneNumber1)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactCompanyName)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactTitle)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactPersonName)
        Me.gcRecipientContact.Controls.Add(Me.txtRecipientContactDepartment)
        Me.gcRecipientContact.Location = New System.Drawing.Point(338, 6)
        Me.gcRecipientContact.Name = "gcRecipientContact"
        Me.gcRecipientContact.Size = New System.Drawing.Size(381, 376)
        Me.gcRecipientContact.TabIndex = 5
        Me.gcRecipientContact.TabStop = False
        Me.gcRecipientContact.Text = "Contact"
        '
        'lblRecipientContactType
        '
        Me.lblRecipientContactType.AutoSize = True
        Me.lblRecipientContactType.Location = New System.Drawing.Point(6, 257)
        Me.lblRecipientContactType.Name = "lblRecipientContactType"
        Me.lblRecipientContactType.Size = New System.Drawing.Size(34, 13)
        Me.lblRecipientContactType.TabIndex = 20
        Me.lblRecipientContactType.Text = "Type:"
        '
        'lblRecipientContactEmailAddress
        '
        Me.lblRecipientContactEmailAddress.AutoSize = True
        Me.lblRecipientContactEmailAddress.Location = New System.Drawing.Point(6, 231)
        Me.lblRecipientContactEmailAddress.Name = "lblRecipientContactEmailAddress"
        Me.lblRecipientContactEmailAddress.Size = New System.Drawing.Size(76, 13)
        Me.lblRecipientContactEmailAddress.TabIndex = 18
        Me.lblRecipientContactEmailAddress.Text = "Email Address:"
        '
        'lblRecipientContactCellPhone
        '
        Me.lblRecipientContactCellPhone.AutoSize = True
        Me.lblRecipientContactCellPhone.Location = New System.Drawing.Point(6, 205)
        Me.lblRecipientContactCellPhone.Name = "lblRecipientContactCellPhone"
        Me.lblRecipientContactCellPhone.Size = New System.Drawing.Size(61, 13)
        Me.lblRecipientContactCellPhone.TabIndex = 16
        Me.lblRecipientContactCellPhone.Text = "Cell Phone:"
        '
        'lblRecipientContactFaxNumber
        '
        Me.lblRecipientContactFaxNumber.AutoSize = True
        Me.lblRecipientContactFaxNumber.Location = New System.Drawing.Point(6, 179)
        Me.lblRecipientContactFaxNumber.Name = "lblRecipientContactFaxNumber"
        Me.lblRecipientContactFaxNumber.Size = New System.Drawing.Size(67, 13)
        Me.lblRecipientContactFaxNumber.TabIndex = 14
        Me.lblRecipientContactFaxNumber.Text = "Fax Number:"
        '
        'lblRecipientContactPhoneNumber2
        '
        Me.lblRecipientContactPhoneNumber2.AutoSize = True
        Me.lblRecipientContactPhoneNumber2.Location = New System.Drawing.Point(6, 153)
        Me.lblRecipientContactPhoneNumber2.Name = "lblRecipientContactPhoneNumber2"
        Me.lblRecipientContactPhoneNumber2.Size = New System.Drawing.Size(87, 13)
        Me.lblRecipientContactPhoneNumber2.TabIndex = 11
        Me.lblRecipientContactPhoneNumber2.Text = "Phone Number2:"
        '
        'lblRecipientContactPhoneNumber1
        '
        Me.lblRecipientContactPhoneNumber1.AutoSize = True
        Me.lblRecipientContactPhoneNumber1.Location = New System.Drawing.Point(6, 127)
        Me.lblRecipientContactPhoneNumber1.Name = "lblRecipientContactPhoneNumber1"
        Me.lblRecipientContactPhoneNumber1.Size = New System.Drawing.Size(87, 13)
        Me.lblRecipientContactPhoneNumber1.TabIndex = 8
        Me.lblRecipientContactPhoneNumber1.Text = "Phone Number1:"
        '
        'lblRecipientContactCompanyName
        '
        Me.lblRecipientContactCompanyName.AutoSize = True
        Me.lblRecipientContactCompanyName.Location = New System.Drawing.Point(6, 101)
        Me.lblRecipientContactCompanyName.Name = "lblRecipientContactCompanyName"
        Me.lblRecipientContactCompanyName.Size = New System.Drawing.Size(85, 13)
        Me.lblRecipientContactCompanyName.TabIndex = 6
        Me.lblRecipientContactCompanyName.Text = "Company Name:"
        '
        'lblRecipientContactTitle
        '
        Me.lblRecipientContactTitle.AutoSize = True
        Me.lblRecipientContactTitle.Location = New System.Drawing.Point(6, 75)
        Me.lblRecipientContactTitle.Name = "lblRecipientContactTitle"
        Me.lblRecipientContactTitle.Size = New System.Drawing.Size(30, 13)
        Me.lblRecipientContactTitle.TabIndex = 4
        Me.lblRecipientContactTitle.Text = "Title:"
        '
        'lblRecipientContactPersonName
        '
        Me.lblRecipientContactPersonName.AutoSize = True
        Me.lblRecipientContactPersonName.Location = New System.Drawing.Point(6, 49)
        Me.lblRecipientContactPersonName.Name = "lblRecipientContactPersonName"
        Me.lblRecipientContactPersonName.Size = New System.Drawing.Size(74, 13)
        Me.lblRecipientContactPersonName.TabIndex = 2
        Me.lblRecipientContactPersonName.Text = "Person Name:"
        '
        'lblRecipientContactDepartment
        '
        Me.lblRecipientContactDepartment.AutoSize = True
        Me.lblRecipientContactDepartment.Location = New System.Drawing.Point(6, 23)
        Me.lblRecipientContactDepartment.Name = "lblRecipientContactDepartment"
        Me.lblRecipientContactDepartment.Size = New System.Drawing.Size(65, 13)
        Me.lblRecipientContactDepartment.TabIndex = 0
        Me.lblRecipientContactDepartment.Text = "Department:"
        '
        'txtRecipientContactType
        '
        Me.txtRecipientContactType.Location = New System.Drawing.Point(100, 253)
        Me.txtRecipientContactType.Name = "txtRecipientContactType"
        Me.txtRecipientContactType.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactType.TabIndex = 21
        '
        'txtRecipientContactEmailAddress
        '
        Me.txtRecipientContactEmailAddress.Location = New System.Drawing.Point(100, 227)
        Me.txtRecipientContactEmailAddress.Name = "txtRecipientContactEmailAddress"
        Me.txtRecipientContactEmailAddress.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactEmailAddress.TabIndex = 19
        '
        'txtRecipientContactCellPhone
        '
        Me.txtRecipientContactCellPhone.Location = New System.Drawing.Point(100, 201)
        Me.txtRecipientContactCellPhone.Name = "txtRecipientContactCellPhone"
        Me.txtRecipientContactCellPhone.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactCellPhone.TabIndex = 17
        '
        'txtRecipientContactFaxNumber
        '
        Me.txtRecipientContactFaxNumber.Location = New System.Drawing.Point(100, 175)
        Me.txtRecipientContactFaxNumber.Name = "txtRecipientContactFaxNumber"
        Me.txtRecipientContactFaxNumber.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactFaxNumber.TabIndex = 15
        '
        'txtRecipientContactPhoneNumber2Ext
        '
        Me.txtRecipientContactPhoneNumber2Ext.Location = New System.Drawing.Point(319, 149)
        Me.txtRecipientContactPhoneNumber2Ext.Name = "txtRecipientContactPhoneNumber2Ext"
        Me.txtRecipientContactPhoneNumber2Ext.Size = New System.Drawing.Size(56, 20)
        Me.txtRecipientContactPhoneNumber2Ext.TabIndex = 13
        '
        'txtRecipientContactPhoneNumber2
        '
        Me.txtRecipientContactPhoneNumber2.Location = New System.Drawing.Point(100, 149)
        Me.txtRecipientContactPhoneNumber2.Name = "txtRecipientContactPhoneNumber2"
        Me.txtRecipientContactPhoneNumber2.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactPhoneNumber2.TabIndex = 12
        '
        'txtRecipientContactPhoneNumber1Ext
        '
        Me.txtRecipientContactPhoneNumber1Ext.Location = New System.Drawing.Point(319, 123)
        Me.txtRecipientContactPhoneNumber1Ext.Name = "txtRecipientContactPhoneNumber1Ext"
        Me.txtRecipientContactPhoneNumber1Ext.Size = New System.Drawing.Size(56, 20)
        Me.txtRecipientContactPhoneNumber1Ext.TabIndex = 10
        '
        'txtRecipientContactPhoneNumber1
        '
        Me.txtRecipientContactPhoneNumber1.Location = New System.Drawing.Point(100, 123)
        Me.txtRecipientContactPhoneNumber1.Name = "txtRecipientContactPhoneNumber1"
        Me.txtRecipientContactPhoneNumber1.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactPhoneNumber1.TabIndex = 9
        '
        'txtRecipientContactCompanyName
        '
        Me.txtRecipientContactCompanyName.Location = New System.Drawing.Point(100, 97)
        Me.txtRecipientContactCompanyName.Name = "txtRecipientContactCompanyName"
        Me.txtRecipientContactCompanyName.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactCompanyName.TabIndex = 7
        '
        'txtRecipientContactTitle
        '
        Me.txtRecipientContactTitle.Location = New System.Drawing.Point(100, 71)
        Me.txtRecipientContactTitle.Name = "txtRecipientContactTitle"
        Me.txtRecipientContactTitle.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactTitle.TabIndex = 5
        '
        'txtRecipientContactPersonName
        '
        Me.txtRecipientContactPersonName.Location = New System.Drawing.Point(100, 45)
        Me.txtRecipientContactPersonName.Name = "txtRecipientContactPersonName"
        Me.txtRecipientContactPersonName.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactPersonName.TabIndex = 3
        '
        'txtRecipientContactDepartment
        '
        Me.txtRecipientContactDepartment.Location = New System.Drawing.Point(100, 19)
        Me.txtRecipientContactDepartment.Name = "txtRecipientContactDepartment"
        Me.txtRecipientContactDepartment.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientContactDepartment.TabIndex = 1
        '
        'gcRecipientAddress
        '
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressCountry)
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressPostCode)
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressState)
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressCity)
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressLine3)
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressLine2)
        Me.gcRecipientAddress.Controls.Add(Me.lblRecipientAddressLine1)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressCountry)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressPostCode)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressState)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressCity)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressLine3)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressLine2)
        Me.gcRecipientAddress.Controls.Add(Me.txtRecipientAddressLine1)
        Me.gcRecipientAddress.Location = New System.Drawing.Point(6, 110)
        Me.gcRecipientAddress.Name = "gcRecipientAddress"
        Me.gcRecipientAddress.Size = New System.Drawing.Size(322, 272)
        Me.gcRecipientAddress.TabIndex = 4
        Me.gcRecipientAddress.TabStop = False
        Me.gcRecipientAddress.Text = "Address"
        '
        'lblRecipientAddressCountry
        '
        Me.lblRecipientAddressCountry.AutoSize = True
        Me.lblRecipientAddressCountry.Location = New System.Drawing.Point(6, 179)
        Me.lblRecipientAddressCountry.Name = "lblRecipientAddressCountry"
        Me.lblRecipientAddressCountry.Size = New System.Drawing.Size(46, 13)
        Me.lblRecipientAddressCountry.TabIndex = 12
        Me.lblRecipientAddressCountry.Text = "Country:"
        '
        'lblRecipientAddressPostCode
        '
        Me.lblRecipientAddressPostCode.AutoSize = True
        Me.lblRecipientAddressPostCode.Location = New System.Drawing.Point(6, 153)
        Me.lblRecipientAddressPostCode.Name = "lblRecipientAddressPostCode"
        Me.lblRecipientAddressPostCode.Size = New System.Drawing.Size(59, 13)
        Me.lblRecipientAddressPostCode.TabIndex = 10
        Me.lblRecipientAddressPostCode.Text = "Post Code:"
        '
        'lblRecipientAddressState
        '
        Me.lblRecipientAddressState.AutoSize = True
        Me.lblRecipientAddressState.Location = New System.Drawing.Point(6, 127)
        Me.lblRecipientAddressState.Name = "lblRecipientAddressState"
        Me.lblRecipientAddressState.Size = New System.Drawing.Size(35, 13)
        Me.lblRecipientAddressState.TabIndex = 8
        Me.lblRecipientAddressState.Text = "State:"
        '
        'lblRecipientAddressCity
        '
        Me.lblRecipientAddressCity.AutoSize = True
        Me.lblRecipientAddressCity.Location = New System.Drawing.Point(6, 101)
        Me.lblRecipientAddressCity.Name = "lblRecipientAddressCity"
        Me.lblRecipientAddressCity.Size = New System.Drawing.Size(27, 13)
        Me.lblRecipientAddressCity.TabIndex = 6
        Me.lblRecipientAddressCity.Text = "City:"
        '
        'lblRecipientAddressLine3
        '
        Me.lblRecipientAddressLine3.AutoSize = True
        Me.lblRecipientAddressLine3.Location = New System.Drawing.Point(6, 75)
        Me.lblRecipientAddressLine3.Name = "lblRecipientAddressLine3"
        Me.lblRecipientAddressLine3.Size = New System.Drawing.Size(36, 13)
        Me.lblRecipientAddressLine3.TabIndex = 4
        Me.lblRecipientAddressLine3.Text = "Line3:"
        '
        'lblRecipientAddressLine2
        '
        Me.lblRecipientAddressLine2.AutoSize = True
        Me.lblRecipientAddressLine2.Location = New System.Drawing.Point(6, 49)
        Me.lblRecipientAddressLine2.Name = "lblRecipientAddressLine2"
        Me.lblRecipientAddressLine2.Size = New System.Drawing.Size(36, 13)
        Me.lblRecipientAddressLine2.TabIndex = 2
        Me.lblRecipientAddressLine2.Text = "Line2:"
        '
        'lblRecipientAddressLine1
        '
        Me.lblRecipientAddressLine1.AutoSize = True
        Me.lblRecipientAddressLine1.Location = New System.Drawing.Point(6, 23)
        Me.lblRecipientAddressLine1.Name = "lblRecipientAddressLine1"
        Me.lblRecipientAddressLine1.Size = New System.Drawing.Size(36, 13)
        Me.lblRecipientAddressLine1.TabIndex = 0
        Me.lblRecipientAddressLine1.Text = "Line1:"
        '
        'txtRecipientAddressCountry
        '
        Me.txtRecipientAddressCountry.Location = New System.Drawing.Point(99, 175)
        Me.txtRecipientAddressCountry.Name = "txtRecipientAddressCountry"
        Me.txtRecipientAddressCountry.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressCountry.TabIndex = 13
        '
        'txtRecipientAddressPostCode
        '
        Me.txtRecipientAddressPostCode.Location = New System.Drawing.Point(99, 149)
        Me.txtRecipientAddressPostCode.Name = "txtRecipientAddressPostCode"
        Me.txtRecipientAddressPostCode.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressPostCode.TabIndex = 11
        '
        'txtRecipientAddressState
        '
        Me.txtRecipientAddressState.Location = New System.Drawing.Point(99, 123)
        Me.txtRecipientAddressState.Name = "txtRecipientAddressState"
        Me.txtRecipientAddressState.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressState.TabIndex = 9
        '
        'txtRecipientAddressCity
        '
        Me.txtRecipientAddressCity.Location = New System.Drawing.Point(99, 97)
        Me.txtRecipientAddressCity.Name = "txtRecipientAddressCity"
        Me.txtRecipientAddressCity.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressCity.TabIndex = 7
        '
        'txtRecipientAddressLine3
        '
        Me.txtRecipientAddressLine3.Location = New System.Drawing.Point(99, 71)
        Me.txtRecipientAddressLine3.Name = "txtRecipientAddressLine3"
        Me.txtRecipientAddressLine3.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressLine3.TabIndex = 5
        '
        'txtRecipientAddressLine2
        '
        Me.txtRecipientAddressLine2.Location = New System.Drawing.Point(99, 45)
        Me.txtRecipientAddressLine2.Name = "txtRecipientAddressLine2"
        Me.txtRecipientAddressLine2.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressLine2.TabIndex = 3
        '
        'txtRecipientAddressLine1
        '
        Me.txtRecipientAddressLine1.Location = New System.Drawing.Point(99, 19)
        Me.txtRecipientAddressLine1.Name = "txtRecipientAddressLine1"
        Me.txtRecipientAddressLine1.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAddressLine1.TabIndex = 1
        '
        'gcRecipientReferences
        '
        Me.gcRecipientReferences.Controls.Add(Me.lblRecipientAccountNumber)
        Me.gcRecipientReferences.Controls.Add(Me.lblRecipientReference2)
        Me.gcRecipientReferences.Controls.Add(Me.lblRecipientReference1)
        Me.gcRecipientReferences.Controls.Add(Me.txtRecipientAccountNumber)
        Me.gcRecipientReferences.Controls.Add(Me.txtRecipientReference2)
        Me.gcRecipientReferences.Controls.Add(Me.txtRecipientReference1)
        Me.gcRecipientReferences.Location = New System.Drawing.Point(6, 6)
        Me.gcRecipientReferences.Name = "gcRecipientReferences"
        Me.gcRecipientReferences.Size = New System.Drawing.Size(322, 98)
        Me.gcRecipientReferences.TabIndex = 0
        Me.gcRecipientReferences.TabStop = False
        Me.gcRecipientReferences.Text = "References"
        '
        'lblRecipientAccountNumber
        '
        Me.lblRecipientAccountNumber.AutoSize = True
        Me.lblRecipientAccountNumber.Location = New System.Drawing.Point(6, 75)
        Me.lblRecipientAccountNumber.Name = "lblRecipientAccountNumber"
        Me.lblRecipientAccountNumber.Size = New System.Drawing.Size(72, 13)
        Me.lblRecipientAccountNumber.TabIndex = 4
        Me.lblRecipientAccountNumber.Text = "Acc. Number:"
        '
        'lblRecipientReference2
        '
        Me.lblRecipientReference2.AutoSize = True
        Me.lblRecipientReference2.Location = New System.Drawing.Point(6, 49)
        Me.lblRecipientReference2.Name = "lblRecipientReference2"
        Me.lblRecipientReference2.Size = New System.Drawing.Size(66, 13)
        Me.lblRecipientReference2.TabIndex = 2
        Me.lblRecipientReference2.Text = "Reference2:"
        '
        'lblRecipientReference1
        '
        Me.lblRecipientReference1.AutoSize = True
        Me.lblRecipientReference1.Location = New System.Drawing.Point(6, 23)
        Me.lblRecipientReference1.Name = "lblRecipientReference1"
        Me.lblRecipientReference1.Size = New System.Drawing.Size(66, 13)
        Me.lblRecipientReference1.TabIndex = 0
        Me.lblRecipientReference1.Text = "Reference1:"
        '
        'txtRecipientAccountNumber
        '
        Me.txtRecipientAccountNumber.Location = New System.Drawing.Point(99, 71)
        Me.txtRecipientAccountNumber.Name = "txtRecipientAccountNumber"
        Me.txtRecipientAccountNumber.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientAccountNumber.TabIndex = 5
        '
        'txtRecipientReference2
        '
        Me.txtRecipientReference2.Location = New System.Drawing.Point(99, 45)
        Me.txtRecipientReference2.Name = "txtRecipientReference2"
        Me.txtRecipientReference2.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientReference2.TabIndex = 3
        '
        'txtRecipientReference1
        '
        Me.txtRecipientReference1.Location = New System.Drawing.Point(99, 19)
        Me.txtRecipientReference1.Name = "txtRecipientReference1"
        Me.txtRecipientReference1.Size = New System.Drawing.Size(217, 20)
        Me.txtRecipientReference1.TabIndex = 1
        '
        'tpThirdParty
        '
        Me.tpThirdParty.Controls.Add(Me.gcThirdPartyContact)
        Me.tpThirdParty.Controls.Add(Me.gcThirdPartyAddress)
        Me.tpThirdParty.Controls.Add(Me.gcThirdPartyReferences)
        Me.tpThirdParty.Location = New System.Drawing.Point(4, 22)
        Me.tpThirdParty.Name = "tpThirdParty"
        Me.tpThirdParty.Size = New System.Drawing.Size(736, 388)
        Me.tpThirdParty.TabIndex = 2
        Me.tpThirdParty.Text = "Third party"
        Me.tpThirdParty.UseVisualStyleBackColor = True
        '
        'gcThirdPartyContact
        '
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactType)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactEmailAddress)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactCellPhone)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactFaxNumber)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactPhoneNumber2)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactPhoneNumber1)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactCompanyName)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactTitle)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactPersonName)
        Me.gcThirdPartyContact.Controls.Add(Me.lblThirdPartyContactDepartment)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactType)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactEmailAddress)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactCellPhone)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactFaxNumber)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactPhoneNumber2Ext)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactPhoneNumber2)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactPhoneNumber1Ext)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactPhoneNumber1)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactCompanyName)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactTitle)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactPersonName)
        Me.gcThirdPartyContact.Controls.Add(Me.txtThirdPartyContactDepartment)
        Me.gcThirdPartyContact.Location = New System.Drawing.Point(338, 6)
        Me.gcThirdPartyContact.Name = "gcThirdPartyContact"
        Me.gcThirdPartyContact.Size = New System.Drawing.Size(381, 379)
        Me.gcThirdPartyContact.TabIndex = 8
        Me.gcThirdPartyContact.TabStop = False
        Me.gcThirdPartyContact.Text = "Contact"
        '
        'lblThirdPartyContactType
        '
        Me.lblThirdPartyContactType.AutoSize = True
        Me.lblThirdPartyContactType.Location = New System.Drawing.Point(6, 257)
        Me.lblThirdPartyContactType.Name = "lblThirdPartyContactType"
        Me.lblThirdPartyContactType.Size = New System.Drawing.Size(34, 13)
        Me.lblThirdPartyContactType.TabIndex = 20
        Me.lblThirdPartyContactType.Text = "Type:"
        '
        'lblThirdPartyContactEmailAddress
        '
        Me.lblThirdPartyContactEmailAddress.AutoSize = True
        Me.lblThirdPartyContactEmailAddress.Location = New System.Drawing.Point(6, 231)
        Me.lblThirdPartyContactEmailAddress.Name = "lblThirdPartyContactEmailAddress"
        Me.lblThirdPartyContactEmailAddress.Size = New System.Drawing.Size(76, 13)
        Me.lblThirdPartyContactEmailAddress.TabIndex = 18
        Me.lblThirdPartyContactEmailAddress.Text = "Email Address:"
        '
        'lblThirdPartyContactCellPhone
        '
        Me.lblThirdPartyContactCellPhone.AutoSize = True
        Me.lblThirdPartyContactCellPhone.Location = New System.Drawing.Point(6, 205)
        Me.lblThirdPartyContactCellPhone.Name = "lblThirdPartyContactCellPhone"
        Me.lblThirdPartyContactCellPhone.Size = New System.Drawing.Size(61, 13)
        Me.lblThirdPartyContactCellPhone.TabIndex = 16
        Me.lblThirdPartyContactCellPhone.Text = "Cell Phone:"
        '
        'lblThirdPartyContactFaxNumber
        '
        Me.lblThirdPartyContactFaxNumber.AutoSize = True
        Me.lblThirdPartyContactFaxNumber.Location = New System.Drawing.Point(6, 179)
        Me.lblThirdPartyContactFaxNumber.Name = "lblThirdPartyContactFaxNumber"
        Me.lblThirdPartyContactFaxNumber.Size = New System.Drawing.Size(67, 13)
        Me.lblThirdPartyContactFaxNumber.TabIndex = 14
        Me.lblThirdPartyContactFaxNumber.Text = "Fax Number:"
        '
        'lblThirdPartyContactPhoneNumber2
        '
        Me.lblThirdPartyContactPhoneNumber2.AutoSize = True
        Me.lblThirdPartyContactPhoneNumber2.Location = New System.Drawing.Point(6, 153)
        Me.lblThirdPartyContactPhoneNumber2.Name = "lblThirdPartyContactPhoneNumber2"
        Me.lblThirdPartyContactPhoneNumber2.Size = New System.Drawing.Size(87, 13)
        Me.lblThirdPartyContactPhoneNumber2.TabIndex = 11
        Me.lblThirdPartyContactPhoneNumber2.Text = "Phone Number2:"
        '
        'lblThirdPartyContactPhoneNumber1
        '
        Me.lblThirdPartyContactPhoneNumber1.AutoSize = True
        Me.lblThirdPartyContactPhoneNumber1.Location = New System.Drawing.Point(6, 127)
        Me.lblThirdPartyContactPhoneNumber1.Name = "lblThirdPartyContactPhoneNumber1"
        Me.lblThirdPartyContactPhoneNumber1.Size = New System.Drawing.Size(87, 13)
        Me.lblThirdPartyContactPhoneNumber1.TabIndex = 8
        Me.lblThirdPartyContactPhoneNumber1.Text = "Phone Number1:"
        '
        'lblThirdPartyContactCompanyName
        '
        Me.lblThirdPartyContactCompanyName.AutoSize = True
        Me.lblThirdPartyContactCompanyName.Location = New System.Drawing.Point(6, 101)
        Me.lblThirdPartyContactCompanyName.Name = "lblThirdPartyContactCompanyName"
        Me.lblThirdPartyContactCompanyName.Size = New System.Drawing.Size(85, 13)
        Me.lblThirdPartyContactCompanyName.TabIndex = 6
        Me.lblThirdPartyContactCompanyName.Text = "Company Name:"
        '
        'lblThirdPartyContactTitle
        '
        Me.lblThirdPartyContactTitle.AutoSize = True
        Me.lblThirdPartyContactTitle.Location = New System.Drawing.Point(6, 75)
        Me.lblThirdPartyContactTitle.Name = "lblThirdPartyContactTitle"
        Me.lblThirdPartyContactTitle.Size = New System.Drawing.Size(30, 13)
        Me.lblThirdPartyContactTitle.TabIndex = 4
        Me.lblThirdPartyContactTitle.Text = "Title:"
        '
        'lblThirdPartyContactPersonName
        '
        Me.lblThirdPartyContactPersonName.AutoSize = True
        Me.lblThirdPartyContactPersonName.Location = New System.Drawing.Point(6, 49)
        Me.lblThirdPartyContactPersonName.Name = "lblThirdPartyContactPersonName"
        Me.lblThirdPartyContactPersonName.Size = New System.Drawing.Size(74, 13)
        Me.lblThirdPartyContactPersonName.TabIndex = 2
        Me.lblThirdPartyContactPersonName.Text = "Person Name:"
        '
        'lblThirdPartyContactDepartment
        '
        Me.lblThirdPartyContactDepartment.AutoSize = True
        Me.lblThirdPartyContactDepartment.Location = New System.Drawing.Point(6, 23)
        Me.lblThirdPartyContactDepartment.Name = "lblThirdPartyContactDepartment"
        Me.lblThirdPartyContactDepartment.Size = New System.Drawing.Size(65, 13)
        Me.lblThirdPartyContactDepartment.TabIndex = 0
        Me.lblThirdPartyContactDepartment.Text = "Department:"
        '
        'txtThirdPartyContactType
        '
        Me.txtThirdPartyContactType.Location = New System.Drawing.Point(100, 253)
        Me.txtThirdPartyContactType.Name = "txtThirdPartyContactType"
        Me.txtThirdPartyContactType.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactType.TabIndex = 21
        '
        'txtThirdPartyContactEmailAddress
        '
        Me.txtThirdPartyContactEmailAddress.Location = New System.Drawing.Point(100, 227)
        Me.txtThirdPartyContactEmailAddress.Name = "txtThirdPartyContactEmailAddress"
        Me.txtThirdPartyContactEmailAddress.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactEmailAddress.TabIndex = 19
        '
        'txtThirdPartyContactCellPhone
        '
        Me.txtThirdPartyContactCellPhone.Location = New System.Drawing.Point(100, 201)
        Me.txtThirdPartyContactCellPhone.Name = "txtThirdPartyContactCellPhone"
        Me.txtThirdPartyContactCellPhone.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactCellPhone.TabIndex = 17
        '
        'txtThirdPartyContactFaxNumber
        '
        Me.txtThirdPartyContactFaxNumber.Location = New System.Drawing.Point(100, 175)
        Me.txtThirdPartyContactFaxNumber.Name = "txtThirdPartyContactFaxNumber"
        Me.txtThirdPartyContactFaxNumber.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactFaxNumber.TabIndex = 15
        '
        'txtThirdPartyContactPhoneNumber2Ext
        '
        Me.txtThirdPartyContactPhoneNumber2Ext.Location = New System.Drawing.Point(319, 149)
        Me.txtThirdPartyContactPhoneNumber2Ext.Name = "txtThirdPartyContactPhoneNumber2Ext"
        Me.txtThirdPartyContactPhoneNumber2Ext.Size = New System.Drawing.Size(56, 20)
        Me.txtThirdPartyContactPhoneNumber2Ext.TabIndex = 13
        '
        'txtThirdPartyContactPhoneNumber2
        '
        Me.txtThirdPartyContactPhoneNumber2.Location = New System.Drawing.Point(100, 149)
        Me.txtThirdPartyContactPhoneNumber2.Name = "txtThirdPartyContactPhoneNumber2"
        Me.txtThirdPartyContactPhoneNumber2.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactPhoneNumber2.TabIndex = 12
        '
        'txtThirdPartyContactPhoneNumber1Ext
        '
        Me.txtThirdPartyContactPhoneNumber1Ext.Location = New System.Drawing.Point(319, 123)
        Me.txtThirdPartyContactPhoneNumber1Ext.Name = "txtThirdPartyContactPhoneNumber1Ext"
        Me.txtThirdPartyContactPhoneNumber1Ext.Size = New System.Drawing.Size(56, 20)
        Me.txtThirdPartyContactPhoneNumber1Ext.TabIndex = 10
        '
        'txtThirdPartyContactPhoneNumber1
        '
        Me.txtThirdPartyContactPhoneNumber1.Location = New System.Drawing.Point(100, 123)
        Me.txtThirdPartyContactPhoneNumber1.Name = "txtThirdPartyContactPhoneNumber1"
        Me.txtThirdPartyContactPhoneNumber1.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactPhoneNumber1.TabIndex = 9
        '
        'txtThirdPartyContactCompanyName
        '
        Me.txtThirdPartyContactCompanyName.Location = New System.Drawing.Point(100, 97)
        Me.txtThirdPartyContactCompanyName.Name = "txtThirdPartyContactCompanyName"
        Me.txtThirdPartyContactCompanyName.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactCompanyName.TabIndex = 7
        '
        'txtThirdPartyContactTitle
        '
        Me.txtThirdPartyContactTitle.Location = New System.Drawing.Point(100, 71)
        Me.txtThirdPartyContactTitle.Name = "txtThirdPartyContactTitle"
        Me.txtThirdPartyContactTitle.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactTitle.TabIndex = 5
        '
        'txtThirdPartyContactPersonName
        '
        Me.txtThirdPartyContactPersonName.Location = New System.Drawing.Point(100, 45)
        Me.txtThirdPartyContactPersonName.Name = "txtThirdPartyContactPersonName"
        Me.txtThirdPartyContactPersonName.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactPersonName.TabIndex = 3
        '
        'txtThirdPartyContactDepartment
        '
        Me.txtThirdPartyContactDepartment.Location = New System.Drawing.Point(100, 19)
        Me.txtThirdPartyContactDepartment.Name = "txtThirdPartyContactDepartment"
        Me.txtThirdPartyContactDepartment.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyContactDepartment.TabIndex = 1
        '
        'gcThirdPartyAddress
        '
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressCountry)
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressPostCode)
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressState)
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressCity)
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressLine3)
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressLine2)
        Me.gcThirdPartyAddress.Controls.Add(Me.lblThirdPartyAddressLine1)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressCountry)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressPostCode)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressState)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressCity)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressLine3)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressLine2)
        Me.gcThirdPartyAddress.Controls.Add(Me.txtThirdPartyAddressLine1)
        Me.gcThirdPartyAddress.Location = New System.Drawing.Point(6, 110)
        Me.gcThirdPartyAddress.Name = "gcThirdPartyAddress"
        Me.gcThirdPartyAddress.Size = New System.Drawing.Size(322, 275)
        Me.gcThirdPartyAddress.TabIndex = 7
        Me.gcThirdPartyAddress.TabStop = False
        Me.gcThirdPartyAddress.Text = "Address"
        '
        'lblThirdPartyAddressCountry
        '
        Me.lblThirdPartyAddressCountry.AutoSize = True
        Me.lblThirdPartyAddressCountry.Location = New System.Drawing.Point(6, 179)
        Me.lblThirdPartyAddressCountry.Name = "lblThirdPartyAddressCountry"
        Me.lblThirdPartyAddressCountry.Size = New System.Drawing.Size(46, 13)
        Me.lblThirdPartyAddressCountry.TabIndex = 12
        Me.lblThirdPartyAddressCountry.Text = "Country:"
        '
        'lblThirdPartyAddressPostCode
        '
        Me.lblThirdPartyAddressPostCode.AutoSize = True
        Me.lblThirdPartyAddressPostCode.Location = New System.Drawing.Point(6, 153)
        Me.lblThirdPartyAddressPostCode.Name = "lblThirdPartyAddressPostCode"
        Me.lblThirdPartyAddressPostCode.Size = New System.Drawing.Size(59, 13)
        Me.lblThirdPartyAddressPostCode.TabIndex = 10
        Me.lblThirdPartyAddressPostCode.Text = "Post Code:"
        '
        'lblThirdPartyAddressState
        '
        Me.lblThirdPartyAddressState.AutoSize = True
        Me.lblThirdPartyAddressState.Location = New System.Drawing.Point(6, 127)
        Me.lblThirdPartyAddressState.Name = "lblThirdPartyAddressState"
        Me.lblThirdPartyAddressState.Size = New System.Drawing.Size(35, 13)
        Me.lblThirdPartyAddressState.TabIndex = 8
        Me.lblThirdPartyAddressState.Text = "State:"
        '
        'lblThirdPartyAddressCity
        '
        Me.lblThirdPartyAddressCity.AutoSize = True
        Me.lblThirdPartyAddressCity.Location = New System.Drawing.Point(6, 101)
        Me.lblThirdPartyAddressCity.Name = "lblThirdPartyAddressCity"
        Me.lblThirdPartyAddressCity.Size = New System.Drawing.Size(27, 13)
        Me.lblThirdPartyAddressCity.TabIndex = 6
        Me.lblThirdPartyAddressCity.Text = "City:"
        '
        'lblThirdPartyAddressLine3
        '
        Me.lblThirdPartyAddressLine3.AutoSize = True
        Me.lblThirdPartyAddressLine3.Location = New System.Drawing.Point(6, 75)
        Me.lblThirdPartyAddressLine3.Name = "lblThirdPartyAddressLine3"
        Me.lblThirdPartyAddressLine3.Size = New System.Drawing.Size(36, 13)
        Me.lblThirdPartyAddressLine3.TabIndex = 4
        Me.lblThirdPartyAddressLine3.Text = "Line3:"
        '
        'lblThirdPartyAddressLine2
        '
        Me.lblThirdPartyAddressLine2.AutoSize = True
        Me.lblThirdPartyAddressLine2.Location = New System.Drawing.Point(6, 49)
        Me.lblThirdPartyAddressLine2.Name = "lblThirdPartyAddressLine2"
        Me.lblThirdPartyAddressLine2.Size = New System.Drawing.Size(36, 13)
        Me.lblThirdPartyAddressLine2.TabIndex = 2
        Me.lblThirdPartyAddressLine2.Text = "Line2:"
        '
        'lblThirdPartyAddressLine1
        '
        Me.lblThirdPartyAddressLine1.AutoSize = True
        Me.lblThirdPartyAddressLine1.Location = New System.Drawing.Point(6, 23)
        Me.lblThirdPartyAddressLine1.Name = "lblThirdPartyAddressLine1"
        Me.lblThirdPartyAddressLine1.Size = New System.Drawing.Size(36, 13)
        Me.lblThirdPartyAddressLine1.TabIndex = 0
        Me.lblThirdPartyAddressLine1.Text = "Line1:"
        '
        'txtThirdPartyAddressCountry
        '
        Me.txtThirdPartyAddressCountry.Location = New System.Drawing.Point(99, 175)
        Me.txtThirdPartyAddressCountry.Name = "txtThirdPartyAddressCountry"
        Me.txtThirdPartyAddressCountry.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressCountry.TabIndex = 13
        '
        'txtThirdPartyAddressPostCode
        '
        Me.txtThirdPartyAddressPostCode.Location = New System.Drawing.Point(99, 149)
        Me.txtThirdPartyAddressPostCode.Name = "txtThirdPartyAddressPostCode"
        Me.txtThirdPartyAddressPostCode.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressPostCode.TabIndex = 11
        '
        'txtThirdPartyAddressState
        '
        Me.txtThirdPartyAddressState.Location = New System.Drawing.Point(99, 123)
        Me.txtThirdPartyAddressState.Name = "txtThirdPartyAddressState"
        Me.txtThirdPartyAddressState.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressState.TabIndex = 9
        '
        'txtThirdPartyAddressCity
        '
        Me.txtThirdPartyAddressCity.Location = New System.Drawing.Point(99, 97)
        Me.txtThirdPartyAddressCity.Name = "txtThirdPartyAddressCity"
        Me.txtThirdPartyAddressCity.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressCity.TabIndex = 7
        '
        'txtThirdPartyAddressLine3
        '
        Me.txtThirdPartyAddressLine3.Location = New System.Drawing.Point(99, 71)
        Me.txtThirdPartyAddressLine3.Name = "txtThirdPartyAddressLine3"
        Me.txtThirdPartyAddressLine3.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressLine3.TabIndex = 5
        '
        'txtThirdPartyAddressLine2
        '
        Me.txtThirdPartyAddressLine2.Location = New System.Drawing.Point(99, 45)
        Me.txtThirdPartyAddressLine2.Name = "txtThirdPartyAddressLine2"
        Me.txtThirdPartyAddressLine2.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressLine2.TabIndex = 3
        '
        'txtThirdPartyAddressLine1
        '
        Me.txtThirdPartyAddressLine1.Location = New System.Drawing.Point(99, 19)
        Me.txtThirdPartyAddressLine1.Name = "txtThirdPartyAddressLine1"
        Me.txtThirdPartyAddressLine1.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAddressLine1.TabIndex = 1
        '
        'gcThirdPartyReferences
        '
        Me.gcThirdPartyReferences.Controls.Add(Me.lblThirdPartyAccountNumber)
        Me.gcThirdPartyReferences.Controls.Add(Me.lblThirdPartyReference2)
        Me.gcThirdPartyReferences.Controls.Add(Me.lblThirdPartyReference1)
        Me.gcThirdPartyReferences.Controls.Add(Me.txtThirdPartyAccountNumber)
        Me.gcThirdPartyReferences.Controls.Add(Me.txtThirdPartyReference2)
        Me.gcThirdPartyReferences.Controls.Add(Me.txtThirdPartyReference1)
        Me.gcThirdPartyReferences.Location = New System.Drawing.Point(6, 6)
        Me.gcThirdPartyReferences.Name = "gcThirdPartyReferences"
        Me.gcThirdPartyReferences.Size = New System.Drawing.Size(322, 98)
        Me.gcThirdPartyReferences.TabIndex = 6
        Me.gcThirdPartyReferences.TabStop = False
        Me.gcThirdPartyReferences.Text = "References"
        '
        'lblThirdPartyAccountNumber
        '
        Me.lblThirdPartyAccountNumber.AutoSize = True
        Me.lblThirdPartyAccountNumber.Location = New System.Drawing.Point(6, 75)
        Me.lblThirdPartyAccountNumber.Name = "lblThirdPartyAccountNumber"
        Me.lblThirdPartyAccountNumber.Size = New System.Drawing.Size(72, 13)
        Me.lblThirdPartyAccountNumber.TabIndex = 4
        Me.lblThirdPartyAccountNumber.Text = "Acc. Number:"
        '
        'lblThirdPartyReference2
        '
        Me.lblThirdPartyReference2.AutoSize = True
        Me.lblThirdPartyReference2.Location = New System.Drawing.Point(6, 49)
        Me.lblThirdPartyReference2.Name = "lblThirdPartyReference2"
        Me.lblThirdPartyReference2.Size = New System.Drawing.Size(66, 13)
        Me.lblThirdPartyReference2.TabIndex = 2
        Me.lblThirdPartyReference2.Text = "Reference2:"
        '
        'lblThirdPartyReference1
        '
        Me.lblThirdPartyReference1.AutoSize = True
        Me.lblThirdPartyReference1.Location = New System.Drawing.Point(6, 23)
        Me.lblThirdPartyReference1.Name = "lblThirdPartyReference1"
        Me.lblThirdPartyReference1.Size = New System.Drawing.Size(66, 13)
        Me.lblThirdPartyReference1.TabIndex = 0
        Me.lblThirdPartyReference1.Text = "Reference1:"
        '
        'txtThirdPartyAccountNumber
        '
        Me.txtThirdPartyAccountNumber.Location = New System.Drawing.Point(99, 71)
        Me.txtThirdPartyAccountNumber.Name = "txtThirdPartyAccountNumber"
        Me.txtThirdPartyAccountNumber.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyAccountNumber.TabIndex = 5
        '
        'txtThirdPartyReference2
        '
        Me.txtThirdPartyReference2.Location = New System.Drawing.Point(99, 45)
        Me.txtThirdPartyReference2.Name = "txtThirdPartyReference2"
        Me.txtThirdPartyReference2.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyReference2.TabIndex = 3
        '
        'txtThirdPartyReference1
        '
        Me.txtThirdPartyReference1.Location = New System.Drawing.Point(99, 19)
        Me.txtThirdPartyReference1.Name = "txtThirdPartyReference1"
        Me.txtThirdPartyReference1.Size = New System.Drawing.Size(217, 20)
        Me.txtThirdPartyReference1.TabIndex = 1
        '
        'tpMain
        '
        Me.tpMain.Controls.Add(Me.gcShipmentAttachments)
        Me.tpMain.Controls.Add(Me.gcShipmentComments)
        Me.tpMain.Controls.Add(Me.gcShipmentDates)
        Me.tpMain.Controls.Add(Me.gcShipmentReferences)
        Me.tpMain.Location = New System.Drawing.Point(4, 22)
        Me.tpMain.Name = "tpMain"
        Me.tpMain.Size = New System.Drawing.Size(736, 388)
        Me.tpMain.TabIndex = 3
        Me.tpMain.Text = "Main"
        Me.tpMain.UseVisualStyleBackColor = True
        '
        'gcShipmentAttachments
        '
        Me.gcShipmentAttachments.Controls.Add(Me.btnRemoveAttachment)
        Me.gcShipmentAttachments.Controls.Add(Me.btnAddAttachment)
        Me.gcShipmentAttachments.Controls.Add(Me.lblFileName)
        Me.gcShipmentAttachments.Controls.Add(Me.lbShipmentAttachments)
        Me.gcShipmentAttachments.Controls.Add(Me.btnAttachment)
        Me.gcShipmentAttachments.Controls.Add(Me.txtShipmentAttachment)
        Me.gcShipmentAttachments.Location = New System.Drawing.Point(6, 220)
        Me.gcShipmentAttachments.Name = "gcShipmentAttachments"
        Me.gcShipmentAttachments.Size = New System.Drawing.Size(322, 165)
        Me.gcShipmentAttachments.TabIndex = 2
        Me.gcShipmentAttachments.TabStop = False
        Me.gcShipmentAttachments.Text = "Attachments"
        '
        'btnRemoveAttachment
        '
        Me.btnRemoveAttachment.Location = New System.Drawing.Point(240, 46)
        Me.btnRemoveAttachment.Name = "btnRemoveAttachment"
        Me.btnRemoveAttachment.Size = New System.Drawing.Size(75, 23)
        Me.btnRemoveAttachment.TabIndex = 4
        Me.btnRemoveAttachment.Text = "Remove"
        Me.btnRemoveAttachment.UseVisualStyleBackColor = True
        '
        'btnAddAttachment
        '
        Me.btnAddAttachment.Location = New System.Drawing.Point(159, 46)
        Me.btnAddAttachment.Name = "btnAddAttachment"
        Me.btnAddAttachment.Size = New System.Drawing.Size(75, 23)
        Me.btnAddAttachment.TabIndex = 3
        Me.btnAddAttachment.Text = "Add"
        Me.btnAddAttachment.UseVisualStyleBackColor = True
        '
        'lblFileName
        '
        Me.lblFileName.AutoSize = True
        Me.lblFileName.Location = New System.Drawing.Point(8, 24)
        Me.lblFileName.Name = "lblFileName"
        Me.lblFileName.Size = New System.Drawing.Size(57, 13)
        Me.lblFileName.TabIndex = 0
        Me.lblFileName.Text = "File Name:"
        '
        'lbShipmentAttachments
        '
        Me.lbShipmentAttachments.FormattingEnabled = True
        Me.lbShipmentAttachments.Location = New System.Drawing.Point(9, 74)
        Me.lbShipmentAttachments.Name = "lbShipmentAttachments"
        Me.lbShipmentAttachments.Size = New System.Drawing.Size(304, 82)
        Me.lbShipmentAttachments.TabIndex = 5
        '
        'btnAttachment
        '
        Me.btnAttachment.Location = New System.Drawing.Point(274, 18)
        Me.btnAttachment.Name = "btnAttachment"
        Me.btnAttachment.Size = New System.Drawing.Size(41, 23)
        Me.btnAttachment.TabIndex = 2
        Me.btnAttachment.Text = "..."
        Me.btnAttachment.UseVisualStyleBackColor = True
        '
        'txtShipmentAttachment
        '
        Me.txtShipmentAttachment.Location = New System.Drawing.Point(99, 20)
        Me.txtShipmentAttachment.Name = "txtShipmentAttachment"
        Me.txtShipmentAttachment.ReadOnly = True
        Me.txtShipmentAttachment.Size = New System.Drawing.Size(169, 20)
        Me.txtShipmentAttachment.TabIndex = 1
        '
        'gcShipmentComments
        '
        Me.gcShipmentComments.Controls.Add(Me.lblShipmentOperationsInstructions)
        Me.gcShipmentComments.Controls.Add(Me.lblShipmentAccountingInstructions)
        Me.gcShipmentComments.Controls.Add(Me.lblShipmentComments)
        Me.gcShipmentComments.Controls.Add(Me.lblShipmentPickupLocation)
        Me.gcShipmentComments.Controls.Add(Me.txtShipmentPickupLocation)
        Me.gcShipmentComments.Controls.Add(Me.txtShipmentOperationsInstructions)
        Me.gcShipmentComments.Controls.Add(Me.txtShipmentAccountingInstructions)
        Me.gcShipmentComments.Controls.Add(Me.txtShipmentComments)
        Me.gcShipmentComments.Location = New System.Drawing.Point(338, 6)
        Me.gcShipmentComments.Name = "gcShipmentComments"
        Me.gcShipmentComments.Size = New System.Drawing.Size(381, 379)
        Me.gcShipmentComments.TabIndex = 3
        Me.gcShipmentComments.TabStop = False
        Me.gcShipmentComments.Text = "Comments"
        '
        'lblShipmentOperationsInstructions
        '
        Me.lblShipmentOperationsInstructions.Location = New System.Drawing.Point(6, 304)
        Me.lblShipmentOperationsInstructions.Name = "lblShipmentOperationsInstructions"
        Me.lblShipmentOperationsInstructions.Size = New System.Drawing.Size(66, 31)
        Me.lblShipmentOperationsInstructions.TabIndex = 6
        Me.lblShipmentOperationsInstructions.Text = "Operations Instructions:"
        '
        'lblShipmentAccountingInstructions
        '
        Me.lblShipmentAccountingInstructions.Location = New System.Drawing.Point(6, 192)
        Me.lblShipmentAccountingInstructions.Name = "lblShipmentAccountingInstructions"
        Me.lblShipmentAccountingInstructions.Size = New System.Drawing.Size(66, 31)
        Me.lblShipmentAccountingInstructions.TabIndex = 4
        Me.lblShipmentAccountingInstructions.Text = "Accounting Instructions:"
        '
        'lblShipmentComments
        '
        Me.lblShipmentComments.AutoSize = True
        Me.lblShipmentComments.Location = New System.Drawing.Point(6, 89)
        Me.lblShipmentComments.Name = "lblShipmentComments"
        Me.lblShipmentComments.Size = New System.Drawing.Size(59, 13)
        Me.lblShipmentComments.TabIndex = 2
        Me.lblShipmentComments.Text = "Comments:"
        '
        'lblShipmentPickupLocation
        '
        Me.lblShipmentPickupLocation.AutoSize = True
        Me.lblShipmentPickupLocation.Location = New System.Drawing.Point(6, 20)
        Me.lblShipmentPickupLocation.Name = "lblShipmentPickupLocation"
        Me.lblShipmentPickupLocation.Size = New System.Drawing.Size(87, 13)
        Me.lblShipmentPickupLocation.TabIndex = 0
        Me.lblShipmentPickupLocation.Text = "Pickup Location:"
        '
        'txtShipmentPickupLocation
        '
        Me.txtShipmentPickupLocation.Location = New System.Drawing.Point(100, 16)
        Me.txtShipmentPickupLocation.Name = "txtShipmentPickupLocation"
        Me.txtShipmentPickupLocation.Size = New System.Drawing.Size(275, 20)
        Me.txtShipmentPickupLocation.TabIndex = 1
        '
        'txtShipmentOperationsInstructions
        '
        Me.txtShipmentOperationsInstructions.Location = New System.Drawing.Point(100, 266)
        Me.txtShipmentOperationsInstructions.Multiline = True
        Me.txtShipmentOperationsInstructions.Name = "txtShipmentOperationsInstructions"
        Me.txtShipmentOperationsInstructions.Size = New System.Drawing.Size(275, 108)
        Me.txtShipmentOperationsInstructions.TabIndex = 7
        '
        'txtShipmentAccountingInstructions
        '
        Me.txtShipmentAccountingInstructions.Location = New System.Drawing.Point(100, 154)
        Me.txtShipmentAccountingInstructions.Multiline = True
        Me.txtShipmentAccountingInstructions.Name = "txtShipmentAccountingInstructions"
        Me.txtShipmentAccountingInstructions.Size = New System.Drawing.Size(275, 108)
        Me.txtShipmentAccountingInstructions.TabIndex = 5
        '
        'txtShipmentComments
        '
        Me.txtShipmentComments.Location = New System.Drawing.Point(100, 42)
        Me.txtShipmentComments.Multiline = True
        Me.txtShipmentComments.Name = "txtShipmentComments"
        Me.txtShipmentComments.Size = New System.Drawing.Size(275, 108)
        Me.txtShipmentComments.TabIndex = 3
        '
        'gcShipmentDates
        '
        Me.gcShipmentDates.Controls.Add(Me.lblShipmentShippingDueDate)
        Me.gcShipmentDates.Controls.Add(Me.lblShipmentShippingDate)
        Me.gcShipmentDates.Controls.Add(Me.dtpShipmentShippingDueDate)
        Me.gcShipmentDates.Controls.Add(Me.dtpShipmentShippingDate)
        Me.gcShipmentDates.Location = New System.Drawing.Point(6, 147)
        Me.gcShipmentDates.Name = "gcShipmentDates"
        Me.gcShipmentDates.Size = New System.Drawing.Size(322, 73)
        Me.gcShipmentDates.TabIndex = 1
        Me.gcShipmentDates.TabStop = False
        Me.gcShipmentDates.Text = "Dates"
        '
        'lblShipmentShippingDueDate
        '
        Me.lblShipmentShippingDueDate.AutoSize = True
        Me.lblShipmentShippingDueDate.Location = New System.Drawing.Point(6, 49)
        Me.lblShipmentShippingDueDate.Name = "lblShipmentShippingDueDate"
        Me.lblShipmentShippingDueDate.Size = New System.Drawing.Size(56, 13)
        Me.lblShipmentShippingDueDate.TabIndex = 2
        Me.lblShipmentShippingDueDate.Text = "Due Date:"
        '
        'lblShipmentShippingDate
        '
        Me.lblShipmentShippingDate.AutoSize = True
        Me.lblShipmentShippingDate.Location = New System.Drawing.Point(6, 23)
        Me.lblShipmentShippingDate.Name = "lblShipmentShippingDate"
        Me.lblShipmentShippingDate.Size = New System.Drawing.Size(77, 13)
        Me.lblShipmentShippingDate.TabIndex = 0
        Me.lblShipmentShippingDate.Text = "Shipping Date:"
        '
        'dtpShipmentShippingDueDate
        '
        Me.dtpShipmentShippingDueDate.Location = New System.Drawing.Point(99, 45)
        Me.dtpShipmentShippingDueDate.Name = "dtpShipmentShippingDueDate"
        Me.dtpShipmentShippingDueDate.Size = New System.Drawing.Size(217, 20)
        Me.dtpShipmentShippingDueDate.TabIndex = 3
        '
        'dtpShipmentShippingDate
        '
        Me.dtpShipmentShippingDate.Location = New System.Drawing.Point(99, 19)
        Me.dtpShipmentShippingDate.Name = "dtpShipmentShippingDate"
        Me.dtpShipmentShippingDate.Size = New System.Drawing.Size(217, 20)
        Me.dtpShipmentShippingDate.TabIndex = 1
        '
        'gcShipmentReferences
        '
        Me.gcShipmentReferences.Controls.Add(Me.lblShipmentTransportType)
        Me.gcShipmentReferences.Controls.Add(Me.nudShipmentTransportType)
        Me.gcShipmentReferences.Controls.Add(Me.lblForeignHAWB)
        Me.gcShipmentReferences.Controls.Add(Me.txtForeignHAWB)
        Me.gcShipmentReferences.Controls.Add(Me.lblShipmentReference3)
        Me.gcShipmentReferences.Controls.Add(Me.lblShipmentReference2)
        Me.gcShipmentReferences.Controls.Add(Me.lblShipmentReference1)
        Me.gcShipmentReferences.Controls.Add(Me.txtShipmentReference3)
        Me.gcShipmentReferences.Controls.Add(Me.txtShipmentReference2)
        Me.gcShipmentReferences.Controls.Add(Me.txtShipmentReference1)
        Me.gcShipmentReferences.Location = New System.Drawing.Point(6, 6)
        Me.gcShipmentReferences.Name = "gcShipmentReferences"
        Me.gcShipmentReferences.Size = New System.Drawing.Size(322, 142)
        Me.gcShipmentReferences.TabIndex = 0
        Me.gcShipmentReferences.TabStop = False
        Me.gcShipmentReferences.Text = "References"
        '
        'lblShipmentTransportType
        '
        Me.lblShipmentTransportType.AutoSize = True
        Me.lblShipmentTransportType.Location = New System.Drawing.Point(6, 119)
        Me.lblShipmentTransportType.Name = "lblShipmentTransportType"
        Me.lblShipmentTransportType.Size = New System.Drawing.Size(82, 13)
        Me.lblShipmentTransportType.TabIndex = 8
        Me.lblShipmentTransportType.Text = "Transport Type:"
        '
        'nudShipmentTransportType
        '
        Me.nudShipmentTransportType.Location = New System.Drawing.Point(99, 115)
        Me.nudShipmentTransportType.Maximum = New Decimal(New Integer() {1, 0, 0, 0})
        Me.nudShipmentTransportType.Name = "nudShipmentTransportType"
        Me.nudShipmentTransportType.Size = New System.Drawing.Size(216, 20)
        Me.nudShipmentTransportType.TabIndex = 9
        '
        'lblForeignHAWB
        '
        Me.lblForeignHAWB.AutoSize = True
        Me.lblForeignHAWB.Location = New System.Drawing.Point(6, 95)
        Me.lblForeignHAWB.Name = "lblForeignHAWB"
        Me.lblForeignHAWB.Size = New System.Drawing.Size(81, 13)
        Me.lblForeignHAWB.TabIndex = 7
        Me.lblForeignHAWB.Text = "Foreign HAWB:"
        '
        'txtForeignHAWB
        '
        Me.txtForeignHAWB.Location = New System.Drawing.Point(99, 91)
        Me.txtForeignHAWB.Name = "txtForeignHAWB"
        Me.txtForeignHAWB.Size = New System.Drawing.Size(217, 20)
        Me.txtForeignHAWB.TabIndex = 7
        '
        'lblShipmentReference3
        '
        Me.lblShipmentReference3.AutoSize = True
        Me.lblShipmentReference3.Location = New System.Drawing.Point(6, 71)
        Me.lblShipmentReference3.Name = "lblShipmentReference3"
        Me.lblShipmentReference3.Size = New System.Drawing.Size(66, 13)
        Me.lblShipmentReference3.TabIndex = 4
        Me.lblShipmentReference3.Text = "Reference3:"
        '
        'lblShipmentReference2
        '
        Me.lblShipmentReference2.AutoSize = True
        Me.lblShipmentReference2.Location = New System.Drawing.Point(6, 47)
        Me.lblShipmentReference2.Name = "lblShipmentReference2"
        Me.lblShipmentReference2.Size = New System.Drawing.Size(66, 13)
        Me.lblShipmentReference2.TabIndex = 2
        Me.lblShipmentReference2.Text = "Reference2:"
        '
        'lblShipmentReference1
        '
        Me.lblShipmentReference1.AutoSize = True
        Me.lblShipmentReference1.Location = New System.Drawing.Point(6, 23)
        Me.lblShipmentReference1.Name = "lblShipmentReference1"
        Me.lblShipmentReference1.Size = New System.Drawing.Size(66, 13)
        Me.lblShipmentReference1.TabIndex = 0
        Me.lblShipmentReference1.Text = "Reference1:"
        '
        'txtShipmentReference3
        '
        Me.txtShipmentReference3.Location = New System.Drawing.Point(99, 67)
        Me.txtShipmentReference3.Name = "txtShipmentReference3"
        Me.txtShipmentReference3.Size = New System.Drawing.Size(217, 20)
        Me.txtShipmentReference3.TabIndex = 5
        '
        'txtShipmentReference2
        '
        Me.txtShipmentReference2.Location = New System.Drawing.Point(99, 43)
        Me.txtShipmentReference2.Name = "txtShipmentReference2"
        Me.txtShipmentReference2.Size = New System.Drawing.Size(217, 20)
        Me.txtShipmentReference2.TabIndex = 3
        '
        'txtShipmentReference1
        '
        Me.txtShipmentReference1.Location = New System.Drawing.Point(99, 19)
        Me.txtShipmentReference1.Name = "txtShipmentReference1"
        Me.txtShipmentReference1.Size = New System.Drawing.Size(217, 20)
        Me.txtShipmentReference1.TabIndex = 1
        '
        'tpDetails
        '
        Me.tpDetails.Controls.Add(Me.gcShipmentDetailsItems)
        Me.tpDetails.Controls.Add(Me.gcShipmentDetailsAmounts)
        Me.tpDetails.Controls.Add(Me.gcShipmentDetailsTypes)
        Me.tpDetails.Controls.Add(Me.gcShipmentDetailsWeights)
        Me.tpDetails.Controls.Add(Me.gcShipmentDetailsDimensions)
        Me.tpDetails.Location = New System.Drawing.Point(4, 22)
        Me.tpDetails.Name = "tpDetails"
        Me.tpDetails.Size = New System.Drawing.Size(736, 388)
        Me.tpDetails.TabIndex = 4
        Me.tpDetails.Text = "Details"
        Me.tpDetails.UseVisualStyleBackColor = True
        '
        'gcShipmentDetailsItems
        '
        Me.gcShipmentDetailsItems.Controls.Add(Me.lvItems)
        Me.gcShipmentDetailsItems.Controls.Add(Me.lblShipmentDetailsItemReference)
        Me.gcShipmentDetailsItems.Controls.Add(Me.lblShipmentDetailsItemComments)
        Me.gcShipmentDetailsItems.Controls.Add(Me.lblShipmentDetailsItemWeight)
        Me.gcShipmentDetailsItems.Controls.Add(Me.lblShipmentDetailsItemQuantity)
        Me.gcShipmentDetailsItems.Controls.Add(Me.btnRemoveItem)
        Me.gcShipmentDetailsItems.Controls.Add(Me.btnAddItem)
        Me.gcShipmentDetailsItems.Controls.Add(Me.txtShipmentDetailsItemReference)
        Me.gcShipmentDetailsItems.Controls.Add(Me.txtShipmentDetailsItemComments)
        Me.gcShipmentDetailsItems.Controls.Add(Me.cmbShipmentDetailsItemWeightUnit)
        Me.gcShipmentDetailsItems.Controls.Add(Me.nudShipmentDetailsItemWeightValue)
        Me.gcShipmentDetailsItems.Controls.Add(Me.nudShipmentDetailsItemQuantity)
        Me.gcShipmentDetailsItems.Controls.Add(Me.txtShipmentDetailsItemPackageType)
        Me.gcShipmentDetailsItems.Controls.Add(Me.lblShipmentDetailsItemPackageType)
        Me.gcShipmentDetailsItems.Location = New System.Drawing.Point(338, 186)
        Me.gcShipmentDetailsItems.Name = "gcShipmentDetailsItems"
        Me.gcShipmentDetailsItems.Size = New System.Drawing.Size(381, 199)
        Me.gcShipmentDetailsItems.TabIndex = 4
        Me.gcShipmentDetailsItems.TabStop = False
        Me.gcShipmentDetailsItems.Text = "Items"
        '
        'lvItems
        '
        Me.lvItems.Columns.AddRange(New System.Windows.Forms.ColumnHeader() {Me.colPackage, Me.colQuantity, Me.colWeight, Me.colComments, Me.colReference})
        Me.lvItems.FullRowSelect = True
        Me.lvItems.GridLines = True
        Me.lvItems.Location = New System.Drawing.Point(10, 99)
        Me.lvItems.MultiSelect = False
        Me.lvItems.Name = "lvItems"
        Me.lvItems.Size = New System.Drawing.Size(365, 93)
        Me.lvItems.TabIndex = 13
        Me.lvItems.UseCompatibleStateImageBehavior = False
        Me.lvItems.View = System.Windows.Forms.View.Details
        '
        'colPackage
        '
        Me.colPackage.Text = "Package"
        '
        'colQuantity
        '
        Me.colQuantity.Text = "Quantity"
        '
        'colWeight
        '
        Me.colWeight.Text = "Weight"
        '
        'colComments
        '
        Me.colComments.Text = "Comments"
        Me.colComments.Width = 101
        '
        'colReference
        '
        Me.colReference.Text = "Reference"
        Me.colReference.Width = 80
        '
        'lblShipmentDetailsItemReference
        '
        Me.lblShipmentDetailsItemReference.AutoSize = True
        Me.lblShipmentDetailsItemReference.Location = New System.Drawing.Point(7, 75)
        Me.lblShipmentDetailsItemReference.Name = "lblShipmentDetailsItemReference"
        Me.lblShipmentDetailsItemReference.Size = New System.Drawing.Size(60, 13)
        Me.lblShipmentDetailsItemReference.TabIndex = 9
        Me.lblShipmentDetailsItemReference.Text = "Reference:"
        '
        'lblShipmentDetailsItemComments
        '
        Me.lblShipmentDetailsItemComments.AutoSize = True
        Me.lblShipmentDetailsItemComments.Location = New System.Drawing.Point(209, 49)
        Me.lblShipmentDetailsItemComments.Name = "lblShipmentDetailsItemComments"
        Me.lblShipmentDetailsItemComments.Size = New System.Drawing.Size(59, 13)
        Me.lblShipmentDetailsItemComments.TabIndex = 7
        Me.lblShipmentDetailsItemComments.Text = "Comments:"
        '
        'lblShipmentDetailsItemWeight
        '
        Me.lblShipmentDetailsItemWeight.AutoSize = True
        Me.lblShipmentDetailsItemWeight.Location = New System.Drawing.Point(7, 48)
        Me.lblShipmentDetailsItemWeight.Name = "lblShipmentDetailsItemWeight"
        Me.lblShipmentDetailsItemWeight.Size = New System.Drawing.Size(44, 13)
        Me.lblShipmentDetailsItemWeight.TabIndex = 4
        Me.lblShipmentDetailsItemWeight.Text = "Weight:"
        '
        'lblShipmentDetailsItemQuantity
        '
        Me.lblShipmentDetailsItemQuantity.AutoSize = True
        Me.lblShipmentDetailsItemQuantity.Location = New System.Drawing.Point(209, 22)
        Me.lblShipmentDetailsItemQuantity.Name = "lblShipmentDetailsItemQuantity"
        Me.lblShipmentDetailsItemQuantity.Size = New System.Drawing.Size(49, 13)
        Me.lblShipmentDetailsItemQuantity.TabIndex = 2
        Me.lblShipmentDetailsItemQuantity.Text = "Quantity:"
        '
        'btnRemoveItem
        '
        Me.btnRemoveItem.Location = New System.Drawing.Point(300, 70)
        Me.btnRemoveItem.Name = "btnRemoveItem"
        Me.btnRemoveItem.Size = New System.Drawing.Size(75, 23)
        Me.btnRemoveItem.TabIndex = 12
        Me.btnRemoveItem.Text = "Remove"
        Me.btnRemoveItem.UseVisualStyleBackColor = True
        '
        'btnAddItem
        '
        Me.btnAddItem.Location = New System.Drawing.Point(212, 70)
        Me.btnAddItem.Name = "btnAddItem"
        Me.btnAddItem.Size = New System.Drawing.Size(75, 23)
        Me.btnAddItem.TabIndex = 11
        Me.btnAddItem.Text = "Add"
        Me.btnAddItem.UseVisualStyleBackColor = True
        '
        'txtShipmentDetailsItemReference
        '
        Me.txtShipmentDetailsItemReference.Location = New System.Drawing.Point(93, 71)
        Me.txtShipmentDetailsItemReference.Name = "txtShipmentDetailsItemReference"
        Me.txtShipmentDetailsItemReference.Size = New System.Drawing.Size(100, 20)
        Me.txtShipmentDetailsItemReference.TabIndex = 10
        '
        'txtShipmentDetailsItemComments
        '
        Me.txtShipmentDetailsItemComments.Location = New System.Drawing.Point(275, 46)
        Me.txtShipmentDetailsItemComments.Name = "txtShipmentDetailsItemComments"
        Me.txtShipmentDetailsItemComments.Size = New System.Drawing.Size(100, 20)
        Me.txtShipmentDetailsItemComments.TabIndex = 8
        '
        'cmbShipmentDetailsItemWeightUnit
        '
        Me.cmbShipmentDetailsItemWeightUnit.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList
        Me.cmbShipmentDetailsItemWeightUnit.FormattingEnabled = True
        Me.cmbShipmentDetailsItemWeightUnit.Items.AddRange(New Object() {"KG", "LB"})
        Me.cmbShipmentDetailsItemWeightUnit.Location = New System.Drawing.Point(149, 44)
        Me.cmbShipmentDetailsItemWeightUnit.Name = "cmbShipmentDetailsItemWeightUnit"
        Me.cmbShipmentDetailsItemWeightUnit.Size = New System.Drawing.Size(44, 21)
        Me.cmbShipmentDetailsItemWeightUnit.TabIndex = 6
        '
        'nudShipmentDetailsItemWeightValue
        '
        Me.nudShipmentDetailsItemWeightValue.DecimalPlaces = 3
        Me.nudShipmentDetailsItemWeightValue.Increment = New Decimal(New Integer() {1, 0, 0, 196608})
        Me.nudShipmentDetailsItemWeightValue.Location = New System.Drawing.Point(93, 44)
        Me.nudShipmentDetailsItemWeightValue.Name = "nudShipmentDetailsItemWeightValue"
        Me.nudShipmentDetailsItemWeightValue.Size = New System.Drawing.Size(50, 20)
        Me.nudShipmentDetailsItemWeightValue.TabIndex = 5
        '
        'nudShipmentDetailsItemQuantity
        '
        Me.nudShipmentDetailsItemQuantity.Location = New System.Drawing.Point(275, 19)
        Me.nudShipmentDetailsItemQuantity.Name = "nudShipmentDetailsItemQuantity"
        Me.nudShipmentDetailsItemQuantity.Size = New System.Drawing.Size(100, 20)
        Me.nudShipmentDetailsItemQuantity.TabIndex = 3
        '
        'txtShipmentDetailsItemPackageType
        '
        Me.txtShipmentDetailsItemPackageType.Location = New System.Drawing.Point(93, 19)
        Me.txtShipmentDetailsItemPackageType.Name = "txtShipmentDetailsItemPackageType"
        Me.txtShipmentDetailsItemPackageType.Size = New System.Drawing.Size(100, 20)
        Me.txtShipmentDetailsItemPackageType.TabIndex = 1
        '
        'lblShipmentDetailsItemPackageType
        '
        Me.lblShipmentDetailsItemPackageType.AutoSize = True
        Me.lblShipmentDetailsItemPackageType.Location = New System.Drawing.Point(6, 23)
        Me.lblShipmentDetailsItemPackageType.Name = "lblShipmentDetailsItemPackageType"
        Me.lblShipmentDetailsItemPackageType.Size = New System.Drawing.Size(80, 13)
        Me.lblShipmentDetailsItemPackageType.TabIndex = 0
        Me.lblShipmentDetailsItemPackageType.Text = "Package Type:"
        '
        'gcShipmentDetailsAmounts
        '
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.lblShipmentDetailsCashAdditionalDescription)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.txtShipmentDetailsCashAdditionalDescription)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.nudShipmentDetailsCustomsValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.nudShipmentDetailsCashAdditionalValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.nudShipmentDetailsCollectValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.nudShipmentDetailsInsuranceValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.nudShipmentDetailsCashOnDeliveryAmountValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.lblShipmentDetailsCustomsValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.lblShipmentDetailsCashAdditionalValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.lblShipmentDetailsCollectValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.lblShipmentDetailsInsuranceValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.lblShipmentDetailsCashOnDeliveryAmountValue)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.txtShipmentDetailsCustomsCurrency)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.txtShipmentDetailsCashAdditionalCurrency)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.txtShipmentDetailsCollectCurrency)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.txtShipmentDetailsInsuranceCurrency)
        Me.gcShipmentDetailsAmounts.Controls.Add(Me.txtShipmentDetailsCashOnDeliveryAmountCurrency)
        Me.gcShipmentDetailsAmounts.Location = New System.Drawing.Point(338, 6)
        Me.gcShipmentDetailsAmounts.Name = "gcShipmentDetailsAmounts"
        Me.gcShipmentDetailsAmounts.Size = New System.Drawing.Size(381, 174)
        Me.gcShipmentDetailsAmounts.TabIndex = 3
        Me.gcShipmentDetailsAmounts.TabStop = False
        Me.gcShipmentDetailsAmounts.Text = "Amounts"
        '
        'lblShipmentDetailsCashAdditionalDescription
        '
        Me.lblShipmentDetailsCashAdditionalDescription.Location = New System.Drawing.Point(7, 115)
        Me.lblShipmentDetailsCashAdditionalDescription.Name = "lblShipmentDetailsCashAdditionalDescription"
        Me.lblShipmentDetailsCashAdditionalDescription.Size = New System.Drawing.Size(83, 27)
        Me.lblShipmentDetailsCashAdditionalDescription.TabIndex = 12
        Me.lblShipmentDetailsCashAdditionalDescription.Text = "Cash Additional Desc:"
        '
        'txtShipmentDetailsCashAdditionalDescription
        '
        Me.txtShipmentDetailsCashAdditionalDescription.Location = New System.Drawing.Point(92, 118)
        Me.txtShipmentDetailsCashAdditionalDescription.Name = "txtShipmentDetailsCashAdditionalDescription"
        Me.txtShipmentDetailsCashAdditionalDescription.Size = New System.Drawing.Size(283, 20)
        Me.txtShipmentDetailsCashAdditionalDescription.TabIndex = 13
        '
        'nudShipmentDetailsCustomsValue
        '
        Me.nudShipmentDetailsCustomsValue.DecimalPlaces = 3
        Me.nudShipmentDetailsCustomsValue.Increment = New Decimal(New Integer() {1, 0, 0, 65536})
        Me.nudShipmentDetailsCustomsValue.Location = New System.Drawing.Point(93, 143)
        Me.nudShipmentDetailsCustomsValue.Name = "nudShipmentDetailsCustomsValue"
        Me.nudShipmentDetailsCustomsValue.Size = New System.Drawing.Size(100, 20)
        Me.nudShipmentDetailsCustomsValue.TabIndex = 15
        '
        'nudShipmentDetailsCashAdditionalValue
        '
        Me.nudShipmentDetailsCashAdditionalValue.DecimalPlaces = 3
        Me.nudShipmentDetailsCashAdditionalValue.Increment = New Decimal(New Integer() {1, 0, 0, 65536})
        Me.nudShipmentDetailsCashAdditionalValue.Location = New System.Drawing.Point(93, 93)
        Me.nudShipmentDetailsCashAdditionalValue.Name = "nudShipmentDetailsCashAdditionalValue"
        Me.nudShipmentDetailsCashAdditionalValue.Size = New System.Drawing.Size(100, 20)
        Me.nudShipmentDetailsCashAdditionalValue.TabIndex = 10
        '
        'nudShipmentDetailsCollectValue
        '
        Me.nudShipmentDetailsCollectValue.DecimalPlaces = 3
        Me.nudShipmentDetailsCollectValue.Increment = New Decimal(New Integer() {1, 0, 0, 65536})
        Me.nudShipmentDetailsCollectValue.Location = New System.Drawing.Point(93, 68)
        Me.nudShipmentDetailsCollectValue.Name = "nudShipmentDetailsCollectValue"
        Me.nudShipmentDetailsCollectValue.Size = New System.Drawing.Size(100, 20)
        Me.nudShipmentDetailsCollectValue.TabIndex = 7
        '
        'nudShipmentDetailsInsuranceValue
        '
        Me.nudShipmentDetailsInsuranceValue.DecimalPlaces = 3
        Me.nudShipmentDetailsInsuranceValue.Increment = New Decimal(New Integer() {1, 0, 0, 65536})
        Me.nudShipmentDetailsInsuranceValue.Location = New System.Drawing.Point(93, 43)
        Me.nudShipmentDetailsInsuranceValue.Name = "nudShipmentDetailsInsuranceValue"
        Me.nudShipmentDetailsInsuranceValue.Size = New System.Drawing.Size(100, 20)
        Me.nudShipmentDetailsInsuranceValue.TabIndex = 4
        '
        'nudShipmentDetailsCashOnDeliveryAmountValue
        '
        Me.nudShipmentDetailsCashOnDeliveryAmountValue.DecimalPlaces = 3
        Me.nudShipmentDetailsCashOnDeliveryAmountValue.Increment = New Decimal(New Integer() {1, 0, 0, 65536})
        Me.nudShipmentDetailsCashOnDeliveryAmountValue.Location = New System.Drawing.Point(93, 18)
        Me.nudShipmentDetailsCashOnDeliveryAmountValue.Name = "nudShipmentDetailsCashOnDeliveryAmountValue"
        Me.nudShipmentDetailsCashOnDeliveryAmountValue.Size = New System.Drawing.Size(100, 20)
        Me.nudShipmentDetailsCashOnDeliveryAmountValue.TabIndex = 1
        '
        'lblShipmentDetailsCustomsValue
        '
        Me.lblShipmentDetailsCustomsValue.AutoSize = True
        Me.lblShipmentDetailsCustomsValue.Location = New System.Drawing.Point(6, 147)
        Me.lblShipmentDetailsCustomsValue.Name = "lblShipmentDetailsCustomsValue"
        Me.lblShipmentDetailsCustomsValue.Size = New System.Drawing.Size(50, 13)
        Me.lblShipmentDetailsCustomsValue.TabIndex = 14
        Me.lblShipmentDetailsCustomsValue.Text = "Customs:"
        '
        'lblShipmentDetailsCashAdditionalValue
        '
        Me.lblShipmentDetailsCashAdditionalValue.AutoSize = True
        Me.lblShipmentDetailsCashAdditionalValue.Location = New System.Drawing.Point(6, 97)
        Me.lblShipmentDetailsCashAdditionalValue.Name = "lblShipmentDetailsCashAdditionalValue"
        Me.lblShipmentDetailsCashAdditionalValue.Size = New System.Drawing.Size(83, 13)
        Me.lblShipmentDetailsCashAdditionalValue.TabIndex = 9
        Me.lblShipmentDetailsCashAdditionalValue.Text = "Cash Additional:"
        '
        'lblShipmentDetailsCollectValue
        '
        Me.lblShipmentDetailsCollectValue.AutoSize = True
        Me.lblShipmentDetailsCollectValue.Location = New System.Drawing.Point(6, 72)
        Me.lblShipmentDetailsCollectValue.Name = "lblShipmentDetailsCollectValue"
        Me.lblShipmentDetailsCollectValue.Size = New System.Drawing.Size(42, 13)
        Me.lblShipmentDetailsCollectValue.TabIndex = 6
        Me.lblShipmentDetailsCollectValue.Text = "Collect:"
        '
        'lblShipmentDetailsInsuranceValue
        '
        Me.lblShipmentDetailsInsuranceValue.AutoSize = True
        Me.lblShipmentDetailsInsuranceValue.Location = New System.Drawing.Point(6, 47)
        Me.lblShipmentDetailsInsuranceValue.Name = "lblShipmentDetailsInsuranceValue"
        Me.lblShipmentDetailsInsuranceValue.Size = New System.Drawing.Size(57, 13)
        Me.lblShipmentDetailsInsuranceValue.TabIndex = 3
        Me.lblShipmentDetailsInsuranceValue.Text = "Insurance:"
        '
        'lblShipmentDetailsCashOnDeliveryAmountValue
        '
        Me.lblShipmentDetailsCashOnDeliveryAmountValue.AutoSize = True
        Me.lblShipmentDetailsCashOnDeliveryAmountValue.Location = New System.Drawing.Point(6, 22)
        Me.lblShipmentDetailsCashOnDeliveryAmountValue.Name = "lblShipmentDetailsCashOnDeliveryAmountValue"
        Me.lblShipmentDetailsCashOnDeliveryAmountValue.Size = New System.Drawing.Size(33, 13)
        Me.lblShipmentDetailsCashOnDeliveryAmountValue.TabIndex = 0
        Me.lblShipmentDetailsCashOnDeliveryAmountValue.Text = "COD:"
        '
        'txtShipmentDetailsCustomsCurrency
        '
        Me.txtShipmentDetailsCustomsCurrency.Location = New System.Drawing.Point(199, 143)
        Me.txtShipmentDetailsCustomsCurrency.Name = "txtShipmentDetailsCustomsCurrency"
        Me.txtShipmentDetailsCustomsCurrency.Size = New System.Drawing.Size(176, 20)
        Me.txtShipmentDetailsCustomsCurrency.TabIndex = 16
        '
        'txtShipmentDetailsCashAdditionalCurrency
        '
        Me.txtShipmentDetailsCashAdditionalCurrency.Location = New System.Drawing.Point(199, 93)
        Me.txtShipmentDetailsCashAdditionalCurrency.Name = "txtShipmentDetailsCashAdditionalCurrency"
        Me.txtShipmentDetailsCashAdditionalCurrency.Size = New System.Drawing.Size(176, 20)
        Me.txtShipmentDetailsCashAdditionalCurrency.TabIndex = 11
        '
        'txtShipmentDetailsCollectCurrency
        '
        Me.txtShipmentDetailsCollectCurrency.Location = New System.Drawing.Point(199, 68)
        Me.txtShipmentDetailsCollectCurrency.Name = "txtShipmentDetailsCollectCurrency"
        Me.txtShipmentDetailsCollectCurrency.Size = New System.Drawing.Size(176, 20)
        Me.txtShipmentDetailsCollectCurrency.TabIndex = 8
        '
        'txtShipmentDetailsInsuranceCurrency
        '
        Me.txtShipmentDetailsInsuranceCurrency.Location = New System.Drawing.Point(199, 43)
        Me.txtShipmentDetailsInsuranceCurrency.Name = "txtShipmentDetailsInsuranceCurrency"
        Me.txtShipmentDetailsInsuranceCurrency.Size = New System.Drawing.Size(176, 20)
        Me.txtShipmentDetailsInsuranceCurrency.TabIndex = 5
        '
        'txtShipmentDetailsCashOnDeliveryAmountCurrency
        '
        Me.txtShipmentDetailsCashOnDeliveryAmountCurrency.Location = New System.Drawing.Point(199, 18)
        Me.txtShipmentDetailsCashOnDeliveryAmountCurrency.Name = "txtShipmentDetailsCashOnDeliveryAmountCurrency"
        Me.txtShipmentDetailsCashOnDeliveryAmountCurrency.Size = New System.Drawing.Size(176, 20)
        Me.txtShipmentDetailsCashOnDeliveryAmountCurrency.TabIndex = 2
        '
        'gcShipmentDetailsTypes
        '
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsGoodsOrigin)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsDescriptionOfGoods)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsGoodsOrigin)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsDescriptionOfGoods)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsNumberOfPieces)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.nudShipmentDetailsNumberOfPieces)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsServices)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsPaymentOptions)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsPaymentType)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsProductType)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.lblShipmentDetailsProductGroup)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsServices)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsPaymentOptions)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsPaymentType)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsProductType)
        Me.gcShipmentDetailsTypes.Controls.Add(Me.txtShipmentDetailsProductGroup)
        Me.gcShipmentDetailsTypes.Location = New System.Drawing.Point(6, 167)
        Me.gcShipmentDetailsTypes.Name = "gcShipmentDetailsTypes"
        Me.gcShipmentDetailsTypes.Size = New System.Drawing.Size(322, 218)
        Me.gcShipmentDetailsTypes.TabIndex = 2
        Me.gcShipmentDetailsTypes.TabStop = False
        Me.gcShipmentDetailsTypes.Text = "Details"
        '
        'lblShipmentDetailsGoodsOrigin
        '
        Me.lblShipmentDetailsGoodsOrigin.AutoSize = True
        Me.lblShipmentDetailsGoodsOrigin.Location = New System.Drawing.Point(8, 198)
        Me.lblShipmentDetailsGoodsOrigin.Name = "lblShipmentDetailsGoodsOrigin"
        Me.lblShipmentDetailsGoodsOrigin.Size = New System.Drawing.Size(71, 13)
        Me.lblShipmentDetailsGoodsOrigin.TabIndex = 17
        Me.lblShipmentDetailsGoodsOrigin.Text = "Goods Origin:"
        '
        'lblShipmentDetailsDescriptionOfGoods
        '
        Me.lblShipmentDetailsDescriptionOfGoods.AutoSize = True
        Me.lblShipmentDetailsDescriptionOfGoods.Location = New System.Drawing.Point(8, 173)
        Me.lblShipmentDetailsDescriptionOfGoods.Name = "lblShipmentDetailsDescriptionOfGoods"
        Me.lblShipmentDetailsDescriptionOfGoods.Size = New System.Drawing.Size(72, 13)
        Me.lblShipmentDetailsDescriptionOfGoods.TabIndex = 15
        Me.lblShipmentDetailsDescriptionOfGoods.Text = "Goods Desc.:"
        '
        'txtShipmentDetailsGoodsOrigin
        '
        Me.txtShipmentDetailsGoodsOrigin.Location = New System.Drawing.Point(99, 194)
        Me.txtShipmentDetailsGoodsOrigin.Name = "txtShipmentDetailsGoodsOrigin"
        Me.txtShipmentDetailsGoodsOrigin.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsGoodsOrigin.TabIndex = 18
        '
        'txtShipmentDetailsDescriptionOfGoods
        '
        Me.txtShipmentDetailsDescriptionOfGoods.Location = New System.Drawing.Point(99, 169)
        Me.txtShipmentDetailsDescriptionOfGoods.Name = "txtShipmentDetailsDescriptionOfGoods"
        Me.txtShipmentDetailsDescriptionOfGoods.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsDescriptionOfGoods.TabIndex = 16
        '
        'lblShipmentDetailsNumberOfPieces
        '
        Me.lblShipmentDetailsNumberOfPieces.AutoSize = True
        Me.lblShipmentDetailsNumberOfPieces.Location = New System.Drawing.Point(8, 148)
        Me.lblShipmentDetailsNumberOfPieces.Name = "lblShipmentDetailsNumberOfPieces"
        Me.lblShipmentDetailsNumberOfPieces.Size = New System.Drawing.Size(74, 13)
        Me.lblShipmentDetailsNumberOfPieces.TabIndex = 15
        Me.lblShipmentDetailsNumberOfPieces.Text = "No. of Pieces:"
        '
        'nudShipmentDetailsNumberOfPieces
        '
        Me.nudShipmentDetailsNumberOfPieces.Location = New System.Drawing.Point(99, 144)
        Me.nudShipmentDetailsNumberOfPieces.Name = "nudShipmentDetailsNumberOfPieces"
        Me.nudShipmentDetailsNumberOfPieces.Size = New System.Drawing.Size(216, 20)
        Me.nudShipmentDetailsNumberOfPieces.TabIndex = 14
        '
        'lblShipmentDetailsServices
        '
        Me.lblShipmentDetailsServices.AutoSize = True
        Me.lblShipmentDetailsServices.Location = New System.Drawing.Point(8, 123)
        Me.lblShipmentDetailsServices.Name = "lblShipmentDetailsServices"
        Me.lblShipmentDetailsServices.Size = New System.Drawing.Size(51, 13)
        Me.lblShipmentDetailsServices.TabIndex = 8
        Me.lblShipmentDetailsServices.Text = "Services:"
        '
        'lblShipmentDetailsPaymentOptions
        '
        Me.lblShipmentDetailsPaymentOptions.AutoSize = True
        Me.lblShipmentDetailsPaymentOptions.Location = New System.Drawing.Point(8, 98)
        Me.lblShipmentDetailsPaymentOptions.Name = "lblShipmentDetailsPaymentOptions"
        Me.lblShipmentDetailsPaymentOptions.Size = New System.Drawing.Size(90, 13)
        Me.lblShipmentDetailsPaymentOptions.TabIndex = 6
        Me.lblShipmentDetailsPaymentOptions.Text = "Payment Options:"
        '
        'lblShipmentDetailsPaymentType
        '
        Me.lblShipmentDetailsPaymentType.AutoSize = True
        Me.lblShipmentDetailsPaymentType.Location = New System.Drawing.Point(8, 73)
        Me.lblShipmentDetailsPaymentType.Name = "lblShipmentDetailsPaymentType"
        Me.lblShipmentDetailsPaymentType.Size = New System.Drawing.Size(78, 13)
        Me.lblShipmentDetailsPaymentType.TabIndex = 4
        Me.lblShipmentDetailsPaymentType.Text = "Payment Type:"
        '
        'lblShipmentDetailsProductType
        '
        Me.lblShipmentDetailsProductType.AutoSize = True
        Me.lblShipmentDetailsProductType.Location = New System.Drawing.Point(8, 48)
        Me.lblShipmentDetailsProductType.Name = "lblShipmentDetailsProductType"
        Me.lblShipmentDetailsProductType.Size = New System.Drawing.Size(74, 13)
        Me.lblShipmentDetailsProductType.TabIndex = 2
        Me.lblShipmentDetailsProductType.Text = "Product Type:"
        '
        'lblShipmentDetailsProductGroup
        '
        Me.lblShipmentDetailsProductGroup.AutoSize = True
        Me.lblShipmentDetailsProductGroup.Location = New System.Drawing.Point(8, 23)
        Me.lblShipmentDetailsProductGroup.Name = "lblShipmentDetailsProductGroup"
        Me.lblShipmentDetailsProductGroup.Size = New System.Drawing.Size(79, 13)
        Me.lblShipmentDetailsProductGroup.TabIndex = 0
        Me.lblShipmentDetailsProductGroup.Text = "Product Group:"
        '
        'txtShipmentDetailsServices
        '
        Me.txtShipmentDetailsServices.Location = New System.Drawing.Point(99, 119)
        Me.txtShipmentDetailsServices.Name = "txtShipmentDetailsServices"
        Me.txtShipmentDetailsServices.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsServices.TabIndex = 9
        '
        'txtShipmentDetailsPaymentOptions
        '
        Me.txtShipmentDetailsPaymentOptions.Location = New System.Drawing.Point(99, 94)
        Me.txtShipmentDetailsPaymentOptions.Name = "txtShipmentDetailsPaymentOptions"
        Me.txtShipmentDetailsPaymentOptions.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsPaymentOptions.TabIndex = 7
        '
        'txtShipmentDetailsPaymentType
        '
        Me.txtShipmentDetailsPaymentType.Location = New System.Drawing.Point(99, 69)
        Me.txtShipmentDetailsPaymentType.Name = "txtShipmentDetailsPaymentType"
        Me.txtShipmentDetailsPaymentType.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsPaymentType.TabIndex = 5
        '
        'txtShipmentDetailsProductType
        '
        Me.txtShipmentDetailsProductType.Location = New System.Drawing.Point(99, 44)
        Me.txtShipmentDetailsProductType.Name = "txtShipmentDetailsProductType"
        Me.txtShipmentDetailsProductType.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsProductType.TabIndex = 3
        '
        'txtShipmentDetailsProductGroup
        '
        Me.txtShipmentDetailsProductGroup.Location = New System.Drawing.Point(99, 19)
        Me.txtShipmentDetailsProductGroup.Name = "txtShipmentDetailsProductGroup"
        Me.txtShipmentDetailsProductGroup.Size = New System.Drawing.Size(216, 20)
        Me.txtShipmentDetailsProductGroup.TabIndex = 1
        '
        'gcShipmentDetailsWeights
        '
        Me.gcShipmentDetailsWeights.Controls.Add(Me.lblShipmentDetailsActualWeightValue)
        Me.gcShipmentDetailsWeights.Controls.Add(Me.lblShipmentDetailsActualWeightUnit)
        Me.gcShipmentDetailsWeights.Controls.Add(Me.cmbShipmentDetailsActualWeightUnit)
        Me.gcShipmentDetailsWeights.Controls.Add(Me.nudShipmentDetailsActualWeightValue)
        Me.gcShipmentDetailsWeights.Location = New System.Drawing.Point(6, 90)
        Me.gcShipmentDetailsWeights.Name = "gcShipmentDetailsWeights"
        Me.gcShipmentDetailsWeights.Size = New System.Drawing.Size(322, 71)
        Me.gcShipmentDetailsWeights.TabIndex = 1
        Me.gcShipmentDetailsWeights.TabStop = False
        Me.gcShipmentDetailsWeights.Text = "Weight"
        '
        'lblShipmentDetailsActualWeightValue
        '
        Me.lblShipmentDetailsActualWeightValue.AutoSize = True
        Me.lblShipmentDetailsActualWeightValue.Location = New System.Drawing.Point(8, 23)
        Me.lblShipmentDetailsActualWeightValue.Name = "lblShipmentDetailsActualWeightValue"
        Me.lblShipmentDetailsActualWeightValue.Size = New System.Drawing.Size(40, 13)
        Me.lblShipmentDetailsActualWeightValue.TabIndex = 0
        Me.lblShipmentDetailsActualWeightValue.Text = "Actual:"
        '
        'lblShipmentDetailsActualWeightUnit
        '
        Me.lblShipmentDetailsActualWeightUnit.AutoSize = True
        Me.lblShipmentDetailsActualWeightUnit.Location = New System.Drawing.Point(170, 22)
        Me.lblShipmentDetailsActualWeightUnit.Name = "lblShipmentDetailsActualWeightUnit"
        Me.lblShipmentDetailsActualWeightUnit.Size = New System.Drawing.Size(29, 13)
        Me.lblShipmentDetailsActualWeightUnit.TabIndex = 2
        Me.lblShipmentDetailsActualWeightUnit.Text = "Unit:"
        '
        'cmbShipmentDetailsActualWeightUnit
        '
        Me.cmbShipmentDetailsActualWeightUnit.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList
        Me.cmbShipmentDetailsActualWeightUnit.FormattingEnabled = True
        Me.cmbShipmentDetailsActualWeightUnit.Items.AddRange(New Object() {"KG", "LB"})
        Me.cmbShipmentDetailsActualWeightUnit.Location = New System.Drawing.Point(253, 18)
        Me.cmbShipmentDetailsActualWeightUnit.Name = "cmbShipmentDetailsActualWeightUnit"
        Me.cmbShipmentDetailsActualWeightUnit.Size = New System.Drawing.Size(62, 21)
        Me.cmbShipmentDetailsActualWeightUnit.TabIndex = 3
        '
        'nudShipmentDetailsActualWeightValue
        '
        Me.nudShipmentDetailsActualWeightValue.DecimalPlaces = 3
        Me.nudShipmentDetailsActualWeightValue.Increment = New Decimal(New Integer() {1, 0, 0, 65536})
        Me.nudShipmentDetailsActualWeightValue.Location = New System.Drawing.Point(99, 19)
        Me.nudShipmentDetailsActualWeightValue.Name = "nudShipmentDetailsActualWeightValue"
        Me.nudShipmentDetailsActualWeightValue.Size = New System.Drawing.Size(63, 20)
        Me.nudShipmentDetailsActualWeightValue.TabIndex = 1
        '
        'gcShipmentDetailsDimensions
        '
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.lblShipmentDetailsDimensionsUnit)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.lblShipmentDetailsDimensionsWidth)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.lblShipmentDetailsDimensionsHeight)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.lblShipmentDetailsDimensionsLength)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.cmbShipmentDetailsDimensionsUnit)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.nudShipmentDetailsDimensionsWidth)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.nudShipmentDetailsDimensionsHeight)
        Me.gcShipmentDetailsDimensions.Controls.Add(Me.nudShipmentDetailsDimensionsLength)
        Me.gcShipmentDetailsDimensions.Location = New System.Drawing.Point(6, 6)
        Me.gcShipmentDetailsDimensions.Name = "gcShipmentDetailsDimensions"
        Me.gcShipmentDetailsDimensions.Size = New System.Drawing.Size(322, 78)
        Me.gcShipmentDetailsDimensions.TabIndex = 0
        Me.gcShipmentDetailsDimensions.TabStop = False
        Me.gcShipmentDetailsDimensions.Text = "Dimensions"
        '
        'lblShipmentDetailsDimensionsUnit
        '
        Me.lblShipmentDetailsDimensionsUnit.AutoSize = True
        Me.lblShipmentDetailsDimensionsUnit.Location = New System.Drawing.Point(168, 49)
        Me.lblShipmentDetailsDimensionsUnit.Name = "lblShipmentDetailsDimensionsUnit"
        Me.lblShipmentDetailsDimensionsUnit.Size = New System.Drawing.Size(29, 13)
        Me.lblShipmentDetailsDimensionsUnit.TabIndex = 6
        Me.lblShipmentDetailsDimensionsUnit.Text = "Unit:"
        '
        'lblShipmentDetailsDimensionsWidth
        '
        Me.lblShipmentDetailsDimensionsWidth.AutoSize = True
        Me.lblShipmentDetailsDimensionsWidth.Location = New System.Drawing.Point(168, 23)
        Me.lblShipmentDetailsDimensionsWidth.Name = "lblShipmentDetailsDimensionsWidth"
        Me.lblShipmentDetailsDimensionsWidth.Size = New System.Drawing.Size(38, 13)
        Me.lblShipmentDetailsDimensionsWidth.TabIndex = 2
        Me.lblShipmentDetailsDimensionsWidth.Text = "Width:"
        '
        'lblShipmentDetailsDimensionsHeight
        '
        Me.lblShipmentDetailsDimensionsHeight.AutoSize = True
        Me.lblShipmentDetailsDimensionsHeight.Location = New System.Drawing.Point(8, 49)
        Me.lblShipmentDetailsDimensionsHeight.Name = "lblShipmentDetailsDimensionsHeight"
        Me.lblShipmentDetailsDimensionsHeight.Size = New System.Drawing.Size(41, 13)
        Me.lblShipmentDetailsDimensionsHeight.TabIndex = 4
        Me.lblShipmentDetailsDimensionsHeight.Text = "Height:"
        '
        'lblShipmentDetailsDimensionsLength
        '
        Me.lblShipmentDetailsDimensionsLength.AutoSize = True
        Me.lblShipmentDetailsDimensionsLength.Location = New System.Drawing.Point(6, 23)
        Me.lblShipmentDetailsDimensionsLength.Name = "lblShipmentDetailsDimensionsLength"
        Me.lblShipmentDetailsDimensionsLength.Size = New System.Drawing.Size(43, 13)
        Me.lblShipmentDetailsDimensionsLength.TabIndex = 0
        Me.lblShipmentDetailsDimensionsLength.Text = "Length:"
        '
        'cmbShipmentDetailsDimensionsUnit
        '
        Me.cmbShipmentDetailsDimensionsUnit.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList
        Me.cmbShipmentDetailsDimensionsUnit.FormattingEnabled = True
        Me.cmbShipmentDetailsDimensionsUnit.Items.AddRange(New Object() {"cm", "m"})
        Me.cmbShipmentDetailsDimensionsUnit.Location = New System.Drawing.Point(253, 45)
        Me.cmbShipmentDetailsDimensionsUnit.Name = "cmbShipmentDetailsDimensionsUnit"
        Me.cmbShipmentDetailsDimensionsUnit.Size = New System.Drawing.Size(62, 21)
        Me.cmbShipmentDetailsDimensionsUnit.TabIndex = 7
        '
        'nudShipmentDetailsDimensionsWidth
        '
        Me.nudShipmentDetailsDimensionsWidth.DecimalPlaces = 2
        Me.nudShipmentDetailsDimensionsWidth.Increment = New Decimal(New Integer() {1, 0, 0, 131072})
        Me.nudShipmentDetailsDimensionsWidth.Location = New System.Drawing.Point(253, 19)
        Me.nudShipmentDetailsDimensionsWidth.Name = "nudShipmentDetailsDimensionsWidth"
        Me.nudShipmentDetailsDimensionsWidth.Size = New System.Drawing.Size(63, 20)
        Me.nudShipmentDetailsDimensionsWidth.TabIndex = 3
        '
        'nudShipmentDetailsDimensionsHeight
        '
        Me.nudShipmentDetailsDimensionsHeight.DecimalPlaces = 2
        Me.nudShipmentDetailsDimensionsHeight.Increment = New Decimal(New Integer() {1, 0, 0, 131072})
        Me.nudShipmentDetailsDimensionsHeight.Location = New System.Drawing.Point(99, 45)
        Me.nudShipmentDetailsDimensionsHeight.Name = "nudShipmentDetailsDimensionsHeight"
        Me.nudShipmentDetailsDimensionsHeight.Size = New System.Drawing.Size(63, 20)
        Me.nudShipmentDetailsDimensionsHeight.TabIndex = 5
        '
        'nudShipmentDetailsDimensionsLength
        '
        Me.nudShipmentDetailsDimensionsLength.DecimalPlaces = 2
        Me.nudShipmentDetailsDimensionsLength.Increment = New Decimal(New Integer() {1, 0, 0, 131072})
        Me.nudShipmentDetailsDimensionsLength.Location = New System.Drawing.Point(99, 19)
        Me.nudShipmentDetailsDimensionsLength.Name = "nudShipmentDetailsDimensionsLength"
        Me.nudShipmentDetailsDimensionsLength.Size = New System.Drawing.Size(63, 20)
        Me.nudShipmentDetailsDimensionsLength.TabIndex = 1
        '
        'TableLayoutPanel1
        '
        Me.TableLayoutPanel1.ColumnCount = 1
        Me.TableLayoutPanel1.ColumnStyles.Add(New System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50.0!))
        Me.TableLayoutPanel1.Controls.Add(Me.TableLayoutPanel2, 0, 0)
        Me.TableLayoutPanel1.Controls.Add(Me.lbShipments, 0, 1)
        Me.TableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill
        Me.TableLayoutPanel1.Location = New System.Drawing.Point(0, 0)
        Me.TableLayoutPanel1.Name = "TableLayoutPanel1"
        Me.TableLayoutPanel1.RowCount = 2
        Me.TableLayoutPanel1.RowStyles.Add(New System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 16.90821!))
        Me.TableLayoutPanel1.RowStyles.Add(New System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 83.09179!))
        Me.TableLayoutPanel1.Size = New System.Drawing.Size(198, 414)
        Me.TableLayoutPanel1.TabIndex = 0
        '
        'TableLayoutPanel2
        '
        Me.TableLayoutPanel2.ColumnCount = 1
        Me.TableLayoutPanel2.ColumnStyles.Add(New System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50.0!))
        Me.TableLayoutPanel2.Controls.Add(Me.btnRemoveShipment, 0, 1)
        Me.TableLayoutPanel2.Controls.Add(Me.btnAddShipment, 0, 0)
        Me.TableLayoutPanel2.Location = New System.Drawing.Point(3, 3)
        Me.TableLayoutPanel2.Name = "TableLayoutPanel2"
        Me.TableLayoutPanel2.RowCount = 2
        Me.TableLayoutPanel2.RowStyles.Add(New System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50.0!))
        Me.TableLayoutPanel2.RowStyles.Add(New System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50.0!))
        Me.TableLayoutPanel2.Size = New System.Drawing.Size(192, 63)
        Me.TableLayoutPanel2.TabIndex = 0
        '
        'btnRemoveShipment
        '
        Me.btnRemoveShipment.Location = New System.Drawing.Point(3, 34)
        Me.btnRemoveShipment.Name = "btnRemoveShipment"
        Me.btnRemoveShipment.Size = New System.Drawing.Size(186, 23)
        Me.btnRemoveShipment.TabIndex = 1
        Me.btnRemoveShipment.Text = "Remove Shipment"
        Me.btnRemoveShipment.UseVisualStyleBackColor = True
        '
        'btnAddShipment
        '
        Me.btnAddShipment.Location = New System.Drawing.Point(3, 3)
        Me.btnAddShipment.Name = "btnAddShipment"
        Me.btnAddShipment.Size = New System.Drawing.Size(186, 23)
        Me.btnAddShipment.TabIndex = 0
        Me.btnAddShipment.Text = "Add Shipment"
        Me.btnAddShipment.UseVisualStyleBackColor = True
        '
        'lbShipments
        '
        Me.lbShipments.Dock = System.Windows.Forms.DockStyle.Fill
        Me.lbShipments.FormattingEnabled = True
        Me.lbShipments.Location = New System.Drawing.Point(3, 72)
        Me.lbShipments.Name = "lbShipments"
        Me.lbShipments.Size = New System.Drawing.Size(192, 339)
        Me.lbShipments.TabIndex = 1
        '
        'btnOK
        '
        Me.btnOK.Location = New System.Drawing.Point(808, 451)
        Me.btnOK.Name = "btnOK"
        Me.btnOK.Size = New System.Drawing.Size(75, 23)
        Me.btnOK.TabIndex = 1
        Me.btnOK.Text = "OK"
        Me.btnOK.UseVisualStyleBackColor = True
        '
        'btnExit
        '
        Me.btnExit.Location = New System.Drawing.Point(889, 451)
        Me.btnExit.Name = "btnExit"
        Me.btnExit.Size = New System.Drawing.Size(75, 23)
        Me.btnExit.TabIndex = 2
        Me.btnExit.Text = "Exit"
        Me.btnExit.UseVisualStyleBackColor = True
        '
        'frmPickupShipments
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(973, 480)
        Me.Controls.Add(Me.btnExit)
        Me.Controls.Add(Me.btnOK)
        Me.Controls.Add(Me.gcShipment)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.MaximizeBox = False
        Me.MinimizeBox = False
        Me.Name = "frmPickupShipments"
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent
        Me.Text = "Pickup - Shipments"
        Me.gcShipment.ResumeLayout(False)
        Me.SplitContainer1.Panel1.ResumeLayout(False)
        Me.SplitContainer1.Panel2.ResumeLayout(False)
        CType(Me.SplitContainer1, System.ComponentModel.ISupportInitialize).EndInit()
        Me.SplitContainer1.ResumeLayout(False)
        Me.tcShipment.ResumeLayout(False)
        Me.tpShipper.ResumeLayout(False)
        Me.gcShipperContact.ResumeLayout(False)
        Me.gcShipperContact.PerformLayout()
        Me.gcShipperAddress.ResumeLayout(False)
        Me.gcShipperAddress.PerformLayout()
        Me.gcShipperReferences.ResumeLayout(False)
        Me.gcShipperReferences.PerformLayout()
        Me.tpRecipient.ResumeLayout(False)
        Me.gcRecipientContact.ResumeLayout(False)
        Me.gcRecipientContact.PerformLayout()
        Me.gcRecipientAddress.ResumeLayout(False)
        Me.gcRecipientAddress.PerformLayout()
        Me.gcRecipientReferences.ResumeLayout(False)
        Me.gcRecipientReferences.PerformLayout()
        Me.tpThirdParty.ResumeLayout(False)
        Me.gcThirdPartyContact.ResumeLayout(False)
        Me.gcThirdPartyContact.PerformLayout()
        Me.gcThirdPartyAddress.ResumeLayout(False)
        Me.gcThirdPartyAddress.PerformLayout()
        Me.gcThirdPartyReferences.ResumeLayout(False)
        Me.gcThirdPartyReferences.PerformLayout()
        Me.tpMain.ResumeLayout(False)
        Me.gcShipmentAttachments.ResumeLayout(False)
        Me.gcShipmentAttachments.PerformLayout()
        Me.gcShipmentComments.ResumeLayout(False)
        Me.gcShipmentComments.PerformLayout()
        Me.gcShipmentDates.ResumeLayout(False)
        Me.gcShipmentDates.PerformLayout()
        Me.gcShipmentReferences.ResumeLayout(False)
        Me.gcShipmentReferences.PerformLayout()
        CType(Me.nudShipmentTransportType, System.ComponentModel.ISupportInitialize).EndInit()
        Me.tpDetails.ResumeLayout(False)
        Me.gcShipmentDetailsItems.ResumeLayout(False)
        Me.gcShipmentDetailsItems.PerformLayout()
        CType(Me.nudShipmentDetailsItemWeightValue, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsItemQuantity, System.ComponentModel.ISupportInitialize).EndInit()
        Me.gcShipmentDetailsAmounts.ResumeLayout(False)
        Me.gcShipmentDetailsAmounts.PerformLayout()
        CType(Me.nudShipmentDetailsCustomsValue, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsCashAdditionalValue, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsCollectValue, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsInsuranceValue, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsCashOnDeliveryAmountValue, System.ComponentModel.ISupportInitialize).EndInit()
        Me.gcShipmentDetailsTypes.ResumeLayout(False)
        Me.gcShipmentDetailsTypes.PerformLayout()
        CType(Me.nudShipmentDetailsNumberOfPieces, System.ComponentModel.ISupportInitialize).EndInit()
        Me.gcShipmentDetailsWeights.ResumeLayout(False)
        Me.gcShipmentDetailsWeights.PerformLayout()
        CType(Me.nudShipmentDetailsActualWeightValue, System.ComponentModel.ISupportInitialize).EndInit()
        Me.gcShipmentDetailsDimensions.ResumeLayout(False)
        Me.gcShipmentDetailsDimensions.PerformLayout()
        CType(Me.nudShipmentDetailsDimensionsWidth, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsDimensionsHeight, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.nudShipmentDetailsDimensionsLength, System.ComponentModel.ISupportInitialize).EndInit()
        Me.TableLayoutPanel1.ResumeLayout(False)
        Me.TableLayoutPanel2.ResumeLayout(False)
        Me.ResumeLayout(False)

    End Sub
    Friend WithEvents gcShipment As System.Windows.Forms.GroupBox
    Friend WithEvents SplitContainer1 As System.Windows.Forms.SplitContainer
    Friend WithEvents tcShipment As System.Windows.Forms.TabControl
    Friend WithEvents tpShipper As System.Windows.Forms.TabPage
    Friend WithEvents gcShipperContact As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipperContactType As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactEmailAddress As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactCellPhone As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactFaxNumber As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactPhoneNumber2 As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactPhoneNumber1 As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactCompanyName As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactTitle As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactPersonName As System.Windows.Forms.Label
    Friend WithEvents lblShipperContactDepartment As System.Windows.Forms.Label
    Friend WithEvents txtShipperContactType As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactEmailAddress As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactCellPhone As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactFaxNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactPhoneNumber2Ext As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactPhoneNumber2 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactPhoneNumber1Ext As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactPhoneNumber1 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactCompanyName As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactTitle As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactPersonName As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperContactDepartment As System.Windows.Forms.TextBox
    Friend WithEvents gcShipperAddress As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipperAddressCountry As System.Windows.Forms.Label
    Friend WithEvents lblShipperAddressPostCode As System.Windows.Forms.Label
    Friend WithEvents lblShipperAddressState As System.Windows.Forms.Label
    Friend WithEvents lblShipperAddressCity As System.Windows.Forms.Label
    Friend WithEvents lblShipperAddressLine3 As System.Windows.Forms.Label
    Friend WithEvents lblShipperAddressLine2 As System.Windows.Forms.Label
    Friend WithEvents lblShipperAddressLine1 As System.Windows.Forms.Label
    Friend WithEvents txtShipperAddressCountry As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperAddressPostCode As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperAddressState As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperAddressCity As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperAddressLine3 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperAddressLine2 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperAddressLine1 As System.Windows.Forms.TextBox
    Friend WithEvents gcShipperReferences As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipperAccountNumber As System.Windows.Forms.Label
    Friend WithEvents lblShipperReference2 As System.Windows.Forms.Label
    Friend WithEvents lblShipperReference1 As System.Windows.Forms.Label
    Friend WithEvents txtShipperAccountNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperReference2 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipperReference1 As System.Windows.Forms.TextBox
    Friend WithEvents tpRecipient As System.Windows.Forms.TabPage
    Friend WithEvents gcRecipientContact As System.Windows.Forms.GroupBox
    Friend WithEvents lblRecipientContactType As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactEmailAddress As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactCellPhone As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactFaxNumber As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactPhoneNumber2 As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactPhoneNumber1 As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactCompanyName As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactTitle As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactPersonName As System.Windows.Forms.Label
    Friend WithEvents lblRecipientContactDepartment As System.Windows.Forms.Label
    Friend WithEvents txtRecipientContactType As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactEmailAddress As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactCellPhone As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactFaxNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactPhoneNumber2Ext As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactPhoneNumber2 As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactPhoneNumber1Ext As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactPhoneNumber1 As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactCompanyName As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactTitle As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactPersonName As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientContactDepartment As System.Windows.Forms.TextBox
    Friend WithEvents gcRecipientAddress As System.Windows.Forms.GroupBox
    Friend WithEvents lblRecipientAddressCountry As System.Windows.Forms.Label
    Friend WithEvents lblRecipientAddressPostCode As System.Windows.Forms.Label
    Friend WithEvents lblRecipientAddressState As System.Windows.Forms.Label
    Friend WithEvents lblRecipientAddressCity As System.Windows.Forms.Label
    Friend WithEvents lblRecipientAddressLine3 As System.Windows.Forms.Label
    Friend WithEvents lblRecipientAddressLine2 As System.Windows.Forms.Label
    Friend WithEvents lblRecipientAddressLine1 As System.Windows.Forms.Label
    Friend WithEvents txtRecipientAddressCountry As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientAddressPostCode As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientAddressState As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientAddressCity As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientAddressLine3 As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientAddressLine2 As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientAddressLine1 As System.Windows.Forms.TextBox
    Friend WithEvents gcRecipientReferences As System.Windows.Forms.GroupBox
    Friend WithEvents lblRecipientAccountNumber As System.Windows.Forms.Label
    Friend WithEvents lblRecipientReference2 As System.Windows.Forms.Label
    Friend WithEvents lblRecipientReference1 As System.Windows.Forms.Label
    Friend WithEvents txtRecipientAccountNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientReference2 As System.Windows.Forms.TextBox
    Friend WithEvents txtRecipientReference1 As System.Windows.Forms.TextBox
    Friend WithEvents tpThirdParty As System.Windows.Forms.TabPage
    Friend WithEvents gcThirdPartyContact As System.Windows.Forms.GroupBox
    Friend WithEvents lblThirdPartyContactType As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactEmailAddress As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactCellPhone As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactFaxNumber As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactPhoneNumber2 As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactPhoneNumber1 As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactCompanyName As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactTitle As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactPersonName As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyContactDepartment As System.Windows.Forms.Label
    Friend WithEvents txtThirdPartyContactType As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactEmailAddress As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactCellPhone As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactFaxNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactPhoneNumber2Ext As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactPhoneNumber2 As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactPhoneNumber1Ext As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactPhoneNumber1 As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactCompanyName As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactTitle As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactPersonName As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyContactDepartment As System.Windows.Forms.TextBox
    Friend WithEvents gcThirdPartyAddress As System.Windows.Forms.GroupBox
    Friend WithEvents lblThirdPartyAddressCountry As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyAddressPostCode As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyAddressState As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyAddressCity As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyAddressLine3 As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyAddressLine2 As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyAddressLine1 As System.Windows.Forms.Label
    Friend WithEvents txtThirdPartyAddressCountry As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyAddressPostCode As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyAddressState As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyAddressCity As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyAddressLine3 As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyAddressLine2 As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyAddressLine1 As System.Windows.Forms.TextBox
    Friend WithEvents gcThirdPartyReferences As System.Windows.Forms.GroupBox
    Friend WithEvents lblThirdPartyAccountNumber As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyReference2 As System.Windows.Forms.Label
    Friend WithEvents lblThirdPartyReference1 As System.Windows.Forms.Label
    Friend WithEvents txtThirdPartyAccountNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyReference2 As System.Windows.Forms.TextBox
    Friend WithEvents txtThirdPartyReference1 As System.Windows.Forms.TextBox
    Friend WithEvents tpMain As System.Windows.Forms.TabPage
    Friend WithEvents gcShipmentAttachments As System.Windows.Forms.GroupBox
    Friend WithEvents btnRemoveAttachment As System.Windows.Forms.Button
    Friend WithEvents btnAddAttachment As System.Windows.Forms.Button
    Friend WithEvents lblFileName As System.Windows.Forms.Label
    Friend WithEvents lbShipmentAttachments As System.Windows.Forms.ListBox
    Friend WithEvents btnAttachment As System.Windows.Forms.Button
    Friend WithEvents txtShipmentAttachment As System.Windows.Forms.TextBox
    Friend WithEvents gcShipmentComments As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentOperationsInstructions As System.Windows.Forms.Label
    Friend WithEvents lblShipmentAccountingInstructions As System.Windows.Forms.Label
    Friend WithEvents lblShipmentComments As System.Windows.Forms.Label
    Friend WithEvents lblShipmentPickupLocation As System.Windows.Forms.Label
    Friend WithEvents txtShipmentPickupLocation As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentOperationsInstructions As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentAccountingInstructions As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentComments As System.Windows.Forms.TextBox
    Friend WithEvents gcShipmentDates As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentShippingDueDate As System.Windows.Forms.Label
    Friend WithEvents lblShipmentShippingDate As System.Windows.Forms.Label
    Friend WithEvents dtpShipmentShippingDueDate As System.Windows.Forms.DateTimePicker
    Friend WithEvents dtpShipmentShippingDate As System.Windows.Forms.DateTimePicker
    Friend WithEvents gcShipmentReferences As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentTransportType As System.Windows.Forms.Label
    Friend WithEvents nudShipmentTransportType As System.Windows.Forms.NumericUpDown
    Friend WithEvents lblForeignHAWB As System.Windows.Forms.Label
    Friend WithEvents txtForeignHAWB As System.Windows.Forms.TextBox
    Friend WithEvents lblShipmentReference3 As System.Windows.Forms.Label
    Friend WithEvents lblShipmentReference2 As System.Windows.Forms.Label
    Friend WithEvents lblShipmentReference1 As System.Windows.Forms.Label
    Friend WithEvents txtShipmentReference3 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentReference2 As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentReference1 As System.Windows.Forms.TextBox
    Friend WithEvents tpDetails As System.Windows.Forms.TabPage
    Friend WithEvents gcShipmentDetailsItems As System.Windows.Forms.GroupBox
    Friend WithEvents lvItems As System.Windows.Forms.ListView
    Friend WithEvents colPackage As System.Windows.Forms.ColumnHeader
    Friend WithEvents colQuantity As System.Windows.Forms.ColumnHeader
    Friend WithEvents colWeight As System.Windows.Forms.ColumnHeader
    Friend WithEvents colComments As System.Windows.Forms.ColumnHeader
    Friend WithEvents colReference As System.Windows.Forms.ColumnHeader
    Friend WithEvents lblShipmentDetailsItemReference As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsItemComments As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsItemWeight As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsItemQuantity As System.Windows.Forms.Label
    Friend WithEvents btnRemoveItem As System.Windows.Forms.Button
    Friend WithEvents btnAddItem As System.Windows.Forms.Button
    Friend WithEvents txtShipmentDetailsItemReference As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsItemComments As System.Windows.Forms.TextBox
    Friend WithEvents cmbShipmentDetailsItemWeightUnit As System.Windows.Forms.ComboBox
    Friend WithEvents nudShipmentDetailsItemWeightValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsItemQuantity As System.Windows.Forms.NumericUpDown
    Friend WithEvents txtShipmentDetailsItemPackageType As System.Windows.Forms.TextBox
    Friend WithEvents lblShipmentDetailsItemPackageType As System.Windows.Forms.Label
    Friend WithEvents gcShipmentDetailsAmounts As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentDetailsCashAdditionalDescription As System.Windows.Forms.Label
    Friend WithEvents txtShipmentDetailsCashAdditionalDescription As System.Windows.Forms.TextBox
    Friend WithEvents nudShipmentDetailsCustomsValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsCashAdditionalValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsCollectValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsInsuranceValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsCashOnDeliveryAmountValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents lblShipmentDetailsCustomsValue As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsCashAdditionalValue As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsCollectValue As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsInsuranceValue As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsCashOnDeliveryAmountValue As System.Windows.Forms.Label
    Friend WithEvents txtShipmentDetailsCustomsCurrency As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsCashAdditionalCurrency As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsCollectCurrency As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsInsuranceCurrency As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsCashOnDeliveryAmountCurrency As System.Windows.Forms.TextBox
    Friend WithEvents gcShipmentDetailsTypes As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentDetailsGoodsOrigin As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsDescriptionOfGoods As System.Windows.Forms.Label
    Friend WithEvents txtShipmentDetailsGoodsOrigin As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsDescriptionOfGoods As System.Windows.Forms.TextBox
    Friend WithEvents lblShipmentDetailsNumberOfPieces As System.Windows.Forms.Label
    Friend WithEvents nudShipmentDetailsNumberOfPieces As System.Windows.Forms.NumericUpDown
    Friend WithEvents lblShipmentDetailsServices As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsPaymentOptions As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsPaymentType As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsProductType As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsProductGroup As System.Windows.Forms.Label
    Friend WithEvents txtShipmentDetailsServices As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsPaymentOptions As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsPaymentType As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsProductType As System.Windows.Forms.TextBox
    Friend WithEvents txtShipmentDetailsProductGroup As System.Windows.Forms.TextBox
    Friend WithEvents gcShipmentDetailsWeights As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentDetailsActualWeightValue As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsActualWeightUnit As System.Windows.Forms.Label
    Friend WithEvents cmbShipmentDetailsActualWeightUnit As System.Windows.Forms.ComboBox
    Friend WithEvents nudShipmentDetailsActualWeightValue As System.Windows.Forms.NumericUpDown
    Friend WithEvents gcShipmentDetailsDimensions As System.Windows.Forms.GroupBox
    Friend WithEvents lblShipmentDetailsDimensionsUnit As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsDimensionsWidth As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsDimensionsHeight As System.Windows.Forms.Label
    Friend WithEvents lblShipmentDetailsDimensionsLength As System.Windows.Forms.Label
    Friend WithEvents cmbShipmentDetailsDimensionsUnit As System.Windows.Forms.ComboBox
    Friend WithEvents nudShipmentDetailsDimensionsWidth As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsDimensionsHeight As System.Windows.Forms.NumericUpDown
    Friend WithEvents nudShipmentDetailsDimensionsLength As System.Windows.Forms.NumericUpDown
    Friend WithEvents TableLayoutPanel1 As System.Windows.Forms.TableLayoutPanel
    Friend WithEvents TableLayoutPanel2 As System.Windows.Forms.TableLayoutPanel
    Friend WithEvents btnRemoveShipment As System.Windows.Forms.Button
    Friend WithEvents btnAddShipment As System.Windows.Forms.Button
    Friend WithEvents lbShipments As System.Windows.Forms.ListBox
    Friend WithEvents btnOK As System.Windows.Forms.Button
    Friend WithEvents btnExit As System.Windows.Forms.Button
    Friend WithEvents ofgAttachment As System.Windows.Forms.OpenFileDialog
End Class
