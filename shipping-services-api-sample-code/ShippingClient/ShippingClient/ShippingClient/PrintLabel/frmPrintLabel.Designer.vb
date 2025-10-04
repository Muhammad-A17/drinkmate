<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmPrintLabel
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
        Me.gcClientInfo = New System.Windows.Forms.GroupBox()
        Me.lblVersion = New System.Windows.Forms.Label()
        Me.lblAccountEntity = New System.Windows.Forms.Label()
        Me.lblAccountCountry = New System.Windows.Forms.Label()
        Me.lblAccountPin = New System.Windows.Forms.Label()
        Me.lblAccountNumber = New System.Windows.Forms.Label()
        Me.lblPassword = New System.Windows.Forms.Label()
        Me.lblUsername = New System.Windows.Forms.Label()
        Me.txtVersion = New System.Windows.Forms.TextBox()
        Me.txtAccountEntity = New System.Windows.Forms.TextBox()
        Me.txtAccountCountryCode = New System.Windows.Forms.TextBox()
        Me.txtAccountPin = New System.Windows.Forms.TextBox()
        Me.txtAccountNumber = New System.Windows.Forms.TextBox()
        Me.txtPassword = New System.Windows.Forms.TextBox()
        Me.txtUsername = New System.Windows.Forms.TextBox()
        Me.gcTransaction = New System.Windows.Forms.GroupBox()
        Me.lblReference5 = New System.Windows.Forms.Label()
        Me.lblReference4 = New System.Windows.Forms.Label()
        Me.lblReference3 = New System.Windows.Forms.Label()
        Me.lblReference2 = New System.Windows.Forms.Label()
        Me.lblReference1 = New System.Windows.Forms.Label()
        Me.txtReference5 = New System.Windows.Forms.TextBox()
        Me.txtReference4 = New System.Windows.Forms.TextBox()
        Me.txtReference3 = New System.Windows.Forms.TextBox()
        Me.txtReference2 = New System.Windows.Forms.TextBox()
        Me.txtReference1 = New System.Windows.Forms.TextBox()
        Me.gcWaybillInformation = New System.Windows.Forms.GroupBox()
        Me.lblProductGroup = New System.Windows.Forms.Label()
        Me.txtProductGroup = New System.Windows.Forms.TextBox()
        Me.lblShipmentNumber = New System.Windows.Forms.Label()
        Me.txtShipmentNumber = New System.Windows.Forms.TextBox()
        Me.gcLabelInfo = New System.Windows.Forms.GroupBox()
        Me.rbReportAsFile = New System.Windows.Forms.RadioButton()
        Me.rbReportAsURL = New System.Windows.Forms.RadioButton()
        Me.lblReportID = New System.Windows.Forms.Label()
        Me.nudReportID = New System.Windows.Forms.NumericUpDown()
        Me.btnReset = New System.Windows.Forms.Button()
        Me.btnSubmitRequest = New System.Windows.Forms.Button()
        Me.txtOriginEntity = New System.Windows.Forms.TextBox()
        Me.lblOrigin = New System.Windows.Forms.Label()
        Me.gcClientInfo.SuspendLayout()
        Me.gcTransaction.SuspendLayout()
        Me.gcWaybillInformation.SuspendLayout()
        Me.gcLabelInfo.SuspendLayout()
        CType(Me.nudReportID, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'gcClientInfo
        '
        Me.gcClientInfo.Controls.Add(Me.lblVersion)
        Me.gcClientInfo.Controls.Add(Me.lblAccountEntity)
        Me.gcClientInfo.Controls.Add(Me.lblAccountCountry)
        Me.gcClientInfo.Controls.Add(Me.lblAccountPin)
        Me.gcClientInfo.Controls.Add(Me.lblAccountNumber)
        Me.gcClientInfo.Controls.Add(Me.lblPassword)
        Me.gcClientInfo.Controls.Add(Me.lblUsername)
        Me.gcClientInfo.Controls.Add(Me.txtVersion)
        Me.gcClientInfo.Controls.Add(Me.txtAccountEntity)
        Me.gcClientInfo.Controls.Add(Me.txtAccountCountryCode)
        Me.gcClientInfo.Controls.Add(Me.txtAccountPin)
        Me.gcClientInfo.Controls.Add(Me.txtAccountNumber)
        Me.gcClientInfo.Controls.Add(Me.txtPassword)
        Me.gcClientInfo.Controls.Add(Me.txtUsername)
        Me.gcClientInfo.Location = New System.Drawing.Point(12, 12)
        Me.gcClientInfo.Name = "gcClientInfo"
        Me.gcClientInfo.Size = New System.Drawing.Size(394, 198)
        Me.gcClientInfo.TabIndex = 0
        Me.gcClientInfo.TabStop = False
        Me.gcClientInfo.Text = "ClientInfo"
        '
        'lblVersion
        '
        Me.lblVersion.AutoSize = True
        Me.lblVersion.Location = New System.Drawing.Point(6, 174)
        Me.lblVersion.Name = "lblVersion"
        Me.lblVersion.Size = New System.Drawing.Size(45, 13)
        Me.lblVersion.TabIndex = 12
        Me.lblVersion.Text = "Version:"
        '
        'lblAccountEntity
        '
        Me.lblAccountEntity.AutoSize = True
        Me.lblAccountEntity.Location = New System.Drawing.Point(6, 147)
        Me.lblAccountEntity.Name = "lblAccountEntity"
        Me.lblAccountEntity.Size = New System.Drawing.Size(61, 13)
        Me.lblAccountEntity.TabIndex = 10
        Me.lblAccountEntity.Text = "Acc. Entity:"
        '
        'lblAccountCountry
        '
        Me.lblAccountCountry.AutoSize = True
        Me.lblAccountCountry.Location = New System.Drawing.Point(6, 122)
        Me.lblAccountCountry.Name = "lblAccountCountry"
        Me.lblAccountCountry.Size = New System.Drawing.Size(71, 13)
        Me.lblAccountCountry.TabIndex = 8
        Me.lblAccountCountry.Text = "Acc. Country:"
        '
        'lblAccountPin
        '
        Me.lblAccountPin.AutoSize = True
        Me.lblAccountPin.Location = New System.Drawing.Point(6, 96)
        Me.lblAccountPin.Name = "lblAccountPin"
        Me.lblAccountPin.Size = New System.Drawing.Size(50, 13)
        Me.lblAccountPin.TabIndex = 6
        Me.lblAccountPin.Text = "Acc. Pin:"
        '
        'lblAccountNumber
        '
        Me.lblAccountNumber.AutoSize = True
        Me.lblAccountNumber.Location = New System.Drawing.Point(6, 70)
        Me.lblAccountNumber.Name = "lblAccountNumber"
        Me.lblAccountNumber.Size = New System.Drawing.Size(52, 13)
        Me.lblAccountNumber.TabIndex = 4
        Me.lblAccountNumber.Text = "Acc. No.:"
        '
        'lblPassword
        '
        Me.lblPassword.AutoSize = True
        Me.lblPassword.Location = New System.Drawing.Point(6, 43)
        Me.lblPassword.Name = "lblPassword"
        Me.lblPassword.Size = New System.Drawing.Size(56, 13)
        Me.lblPassword.TabIndex = 2
        Me.lblPassword.Text = "Password:"
        '
        'lblUsername
        '
        Me.lblUsername.AutoSize = True
        Me.lblUsername.Location = New System.Drawing.Point(6, 18)
        Me.lblUsername.Name = "lblUsername"
        Me.lblUsername.Size = New System.Drawing.Size(58, 13)
        Me.lblUsername.TabIndex = 0
        Me.lblUsername.Text = "Username:"
        '
        'txtVersion
        '
        Me.txtVersion.Location = New System.Drawing.Point(78, 170)
        Me.txtVersion.Name = "txtVersion"
        Me.txtVersion.Size = New System.Drawing.Size(306, 20)
        Me.txtVersion.TabIndex = 13
        Me.txtVersion.Text = "1.0"
        '
        'txtAccountEntity
        '
        Me.txtAccountEntity.Location = New System.Drawing.Point(78, 144)
        Me.txtAccountEntity.Name = "txtAccountEntity"
        Me.txtAccountEntity.Size = New System.Drawing.Size(306, 20)
        Me.txtAccountEntity.TabIndex = 11
        Me.txtAccountEntity.Text = "AMM"
        '
        'txtAccountCountryCode
        '
        Me.txtAccountCountryCode.Location = New System.Drawing.Point(78, 118)
        Me.txtAccountCountryCode.Name = "txtAccountCountryCode"
        Me.txtAccountCountryCode.Size = New System.Drawing.Size(306, 20)
        Me.txtAccountCountryCode.TabIndex = 9
        Me.txtAccountCountryCode.Text = "JO"
        '
        'txtAccountPin
        '
        Me.txtAccountPin.Location = New System.Drawing.Point(78, 92)
        Me.txtAccountPin.Name = "txtAccountPin"
        Me.txtAccountPin.Size = New System.Drawing.Size(306, 20)
        Me.txtAccountPin.TabIndex = 7
        Me.txtAccountPin.Text = "221321"
        '
        'txtAccountNumber
        '
        Me.txtAccountNumber.Location = New System.Drawing.Point(78, 66)
        Me.txtAccountNumber.Name = "txtAccountNumber"
        Me.txtAccountNumber.Size = New System.Drawing.Size(306, 20)
        Me.txtAccountNumber.TabIndex = 5
        Me.txtAccountNumber.Text = "20016"
        '
        'txtPassword
        '
        Me.txtPassword.Location = New System.Drawing.Point(78, 40)
        Me.txtPassword.Name = "txtPassword"
        Me.txtPassword.Size = New System.Drawing.Size(306, 20)
        Me.txtPassword.TabIndex = 3
        Me.txtPassword.Text = "123456789"
        '
        'txtUsername
        '
        Me.txtUsername.Location = New System.Drawing.Point(78, 14)
        Me.txtUsername.Name = "txtUsername"
        Me.txtUsername.Size = New System.Drawing.Size(306, 20)
        Me.txtUsername.TabIndex = 1
        Me.txtUsername.Text = "reem@reem.com"
        '
        'gcTransaction
        '
        Me.gcTransaction.Controls.Add(Me.lblReference5)
        Me.gcTransaction.Controls.Add(Me.lblReference4)
        Me.gcTransaction.Controls.Add(Me.lblReference3)
        Me.gcTransaction.Controls.Add(Me.lblReference2)
        Me.gcTransaction.Controls.Add(Me.lblReference1)
        Me.gcTransaction.Controls.Add(Me.txtReference5)
        Me.gcTransaction.Controls.Add(Me.txtReference4)
        Me.gcTransaction.Controls.Add(Me.txtReference3)
        Me.gcTransaction.Controls.Add(Me.txtReference2)
        Me.gcTransaction.Controls.Add(Me.txtReference1)
        Me.gcTransaction.Location = New System.Drawing.Point(12, 216)
        Me.gcTransaction.Name = "gcTransaction"
        Me.gcTransaction.Size = New System.Drawing.Size(394, 147)
        Me.gcTransaction.TabIndex = 1
        Me.gcTransaction.TabStop = False
        Me.gcTransaction.Text = "Transaction"
        '
        'lblReference5
        '
        Me.lblReference5.AutoSize = True
        Me.lblReference5.Location = New System.Drawing.Point(6, 122)
        Me.lblReference5.Name = "lblReference5"
        Me.lblReference5.Size = New System.Drawing.Size(66, 13)
        Me.lblReference5.TabIndex = 8
        Me.lblReference5.Text = "Reference5:"
        '
        'lblReference4
        '
        Me.lblReference4.AutoSize = True
        Me.lblReference4.Location = New System.Drawing.Point(6, 96)
        Me.lblReference4.Name = "lblReference4"
        Me.lblReference4.Size = New System.Drawing.Size(66, 13)
        Me.lblReference4.TabIndex = 6
        Me.lblReference4.Text = "Reference4:"
        '
        'lblReference3
        '
        Me.lblReference3.AutoSize = True
        Me.lblReference3.Location = New System.Drawing.Point(6, 70)
        Me.lblReference3.Name = "lblReference3"
        Me.lblReference3.Size = New System.Drawing.Size(66, 13)
        Me.lblReference3.TabIndex = 4
        Me.lblReference3.Text = "Reference3:"
        '
        'lblReference2
        '
        Me.lblReference2.AutoSize = True
        Me.lblReference2.Location = New System.Drawing.Point(6, 44)
        Me.lblReference2.Name = "lblReference2"
        Me.lblReference2.Size = New System.Drawing.Size(66, 13)
        Me.lblReference2.TabIndex = 2
        Me.lblReference2.Text = "Reference2:"
        '
        'lblReference1
        '
        Me.lblReference1.AutoSize = True
        Me.lblReference1.Location = New System.Drawing.Point(6, 18)
        Me.lblReference1.Name = "lblReference1"
        Me.lblReference1.Size = New System.Drawing.Size(66, 13)
        Me.lblReference1.TabIndex = 0
        Me.lblReference1.Text = "Reference1:"
        '
        'txtReference5
        '
        Me.txtReference5.Location = New System.Drawing.Point(78, 118)
        Me.txtReference5.Name = "txtReference5"
        Me.txtReference5.Size = New System.Drawing.Size(310, 20)
        Me.txtReference5.TabIndex = 9
        '
        'txtReference4
        '
        Me.txtReference4.Location = New System.Drawing.Point(78, 92)
        Me.txtReference4.Name = "txtReference4"
        Me.txtReference4.Size = New System.Drawing.Size(310, 20)
        Me.txtReference4.TabIndex = 7
        '
        'txtReference3
        '
        Me.txtReference3.Location = New System.Drawing.Point(78, 66)
        Me.txtReference3.Name = "txtReference3"
        Me.txtReference3.Size = New System.Drawing.Size(310, 20)
        Me.txtReference3.TabIndex = 5
        '
        'txtReference2
        '
        Me.txtReference2.Location = New System.Drawing.Point(78, 40)
        Me.txtReference2.Name = "txtReference2"
        Me.txtReference2.Size = New System.Drawing.Size(310, 20)
        Me.txtReference2.TabIndex = 3
        '
        'txtReference1
        '
        Me.txtReference1.Location = New System.Drawing.Point(78, 14)
        Me.txtReference1.Name = "txtReference1"
        Me.txtReference1.Size = New System.Drawing.Size(310, 20)
        Me.txtReference1.TabIndex = 1
        '
        'gcWaybillInformation
        '
        Me.gcWaybillInformation.Controls.Add(Me.lblOrigin)
        Me.gcWaybillInformation.Controls.Add(Me.txtOriginEntity)
        Me.gcWaybillInformation.Controls.Add(Me.lblProductGroup)
        Me.gcWaybillInformation.Controls.Add(Me.txtProductGroup)
        Me.gcWaybillInformation.Controls.Add(Me.lblShipmentNumber)
        Me.gcWaybillInformation.Controls.Add(Me.txtShipmentNumber)
        Me.gcWaybillInformation.Location = New System.Drawing.Point(412, 12)
        Me.gcWaybillInformation.Name = "gcWaybillInformation"
        Me.gcWaybillInformation.Size = New System.Drawing.Size(394, 99)
        Me.gcWaybillInformation.TabIndex = 2
        Me.gcWaybillInformation.TabStop = False
        Me.gcWaybillInformation.Text = "Waybill"
        '
        'lblProductGroup
        '
        Me.lblProductGroup.Location = New System.Drawing.Point(6, 36)
        Me.lblProductGroup.Name = "lblProductGroup"
        Me.lblProductGroup.Size = New System.Drawing.Size(44, 30)
        Me.lblProductGroup.TabIndex = 2
        Me.lblProductGroup.Text = "Product Group:"
        '
        'txtProductGroup
        '
        Me.txtProductGroup.Location = New System.Drawing.Point(68, 41)
        Me.txtProductGroup.MaxLength = 3
        Me.txtProductGroup.Name = "txtProductGroup"
        Me.txtProductGroup.Size = New System.Drawing.Size(310, 20)
        Me.txtProductGroup.TabIndex = 3
        '
        'lblShipmentNumber
        '
        Me.lblShipmentNumber.AutoSize = True
        Me.lblShipmentNumber.Location = New System.Drawing.Point(6, 19)
        Me.lblShipmentNumber.Name = "lblShipmentNumber"
        Me.lblShipmentNumber.Size = New System.Drawing.Size(44, 13)
        Me.lblShipmentNumber.TabIndex = 0
        Me.lblShipmentNumber.Text = "Waybill:"
        '
        'txtShipmentNumber
        '
        Me.txtShipmentNumber.Location = New System.Drawing.Point(68, 15)
        Me.txtShipmentNumber.MaxLength = 10
        Me.txtShipmentNumber.Name = "txtShipmentNumber"
        Me.txtShipmentNumber.Size = New System.Drawing.Size(310, 20)
        Me.txtShipmentNumber.TabIndex = 1
        '
        'gcLabelInfo
        '
        Me.gcLabelInfo.Controls.Add(Me.rbReportAsFile)
        Me.gcLabelInfo.Controls.Add(Me.rbReportAsURL)
        Me.gcLabelInfo.Controls.Add(Me.lblReportID)
        Me.gcLabelInfo.Controls.Add(Me.nudReportID)
        Me.gcLabelInfo.Location = New System.Drawing.Point(411, 118)
        Me.gcLabelInfo.Name = "gcLabelInfo"
        Me.gcLabelInfo.Size = New System.Drawing.Size(394, 58)
        Me.gcLabelInfo.TabIndex = 4
        Me.gcLabelInfo.TabStop = False
        Me.gcLabelInfo.Text = "Label"
        '
        'rbReportAsFile
        '
        Me.rbReportAsFile.AutoSize = True
        Me.rbReportAsFile.Location = New System.Drawing.Point(288, 30)
        Me.rbReportAsFile.Name = "rbReportAsFile"
        Me.rbReportAsFile.Size = New System.Drawing.Size(90, 17)
        Me.rbReportAsFile.TabIndex = 3
        Me.rbReportAsFile.TabStop = True
        Me.rbReportAsFile.Text = "Report as File"
        Me.rbReportAsFile.UseVisualStyleBackColor = True
        '
        'rbReportAsURL
        '
        Me.rbReportAsURL.AutoSize = True
        Me.rbReportAsURL.Location = New System.Drawing.Point(288, 12)
        Me.rbReportAsURL.Name = "rbReportAsURL"
        Me.rbReportAsURL.Size = New System.Drawing.Size(96, 17)
        Me.rbReportAsURL.TabIndex = 2
        Me.rbReportAsURL.TabStop = True
        Me.rbReportAsURL.Text = "Report as URL"
        Me.rbReportAsURL.UseVisualStyleBackColor = True
        '
        'lblReportID
        '
        Me.lblReportID.AutoSize = True
        Me.lblReportID.Location = New System.Drawing.Point(6, 20)
        Me.lblReportID.Name = "lblReportID"
        Me.lblReportID.Size = New System.Drawing.Size(56, 13)
        Me.lblReportID.TabIndex = 0
        Me.lblReportID.Text = "Report ID:"
        '
        'nudReportID
        '
        Me.nudReportID.Location = New System.Drawing.Point(68, 16)
        Me.nudReportID.Maximum = New Decimal(New Integer() {10000, 0, 0, 0})
        Me.nudReportID.Name = "nudReportID"
        Me.nudReportID.Size = New System.Drawing.Size(214, 20)
        Me.nudReportID.TabIndex = 1
        Me.nudReportID.Value = New Decimal(New Integer() {9201, 0, 0, 0})
        '
        'btnReset
        '
        Me.btnReset.Location = New System.Drawing.Point(672, 369)
        Me.btnReset.Name = "btnReset"
        Me.btnReset.Size = New System.Drawing.Size(134, 23)
        Me.btnReset.TabIndex = 6
        Me.btnReset.Text = "Reset"
        Me.btnReset.UseVisualStyleBackColor = True
        '
        'btnSubmitRequest
        '
        Me.btnSubmitRequest.Location = New System.Drawing.Point(532, 369)
        Me.btnSubmitRequest.Name = "btnSubmitRequest"
        Me.btnSubmitRequest.Size = New System.Drawing.Size(134, 23)
        Me.btnSubmitRequest.TabIndex = 5
        Me.btnSubmitRequest.Text = "Submit Request"
        Me.btnSubmitRequest.UseVisualStyleBackColor = True
        '
        'txtOriginEntity
        '
        Me.txtOriginEntity.Location = New System.Drawing.Point(68, 66)
        Me.txtOriginEntity.MaxLength = 3
        Me.txtOriginEntity.Name = "txtOriginEntity"
        Me.txtOriginEntity.Size = New System.Drawing.Size(310, 20)
        Me.txtOriginEntity.TabIndex = 5
        '
        'lblOrigin
        '
        Me.lblOrigin.AutoSize = True
        Me.lblOrigin.Location = New System.Drawing.Point(6, 70)
        Me.lblOrigin.Name = "lblOrigin"
        Me.lblOrigin.Size = New System.Drawing.Size(37, 13)
        Me.lblOrigin.TabIndex = 4
        Me.lblOrigin.Text = "Origin:"
        '
        'frmPrintLabel
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(817, 402)
        Me.Controls.Add(Me.btnReset)
        Me.Controls.Add(Me.btnSubmitRequest)
        Me.Controls.Add(Me.gcLabelInfo)
        Me.Controls.Add(Me.gcWaybillInformation)
        Me.Controls.Add(Me.gcTransaction)
        Me.Controls.Add(Me.gcClientInfo)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.MaximizeBox = False
        Me.MinimizeBox = False
        Me.Name = "frmPrintLabel"
        Me.ShowInTaskbar = False
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent
        Me.Text = "Shipping API - Shipping Client - Label Printing Service"
        Me.gcClientInfo.ResumeLayout(False)
        Me.gcClientInfo.PerformLayout()
        Me.gcTransaction.ResumeLayout(False)
        Me.gcTransaction.PerformLayout()
        Me.gcWaybillInformation.ResumeLayout(False)
        Me.gcWaybillInformation.PerformLayout()
        Me.gcLabelInfo.ResumeLayout(False)
        Me.gcLabelInfo.PerformLayout()
        CType(Me.nudReportID, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)

    End Sub
    Friend WithEvents gcClientInfo As System.Windows.Forms.GroupBox
    Friend WithEvents lblVersion As System.Windows.Forms.Label
    Friend WithEvents lblAccountEntity As System.Windows.Forms.Label
    Friend WithEvents lblAccountCountry As System.Windows.Forms.Label
    Friend WithEvents lblAccountPin As System.Windows.Forms.Label
    Friend WithEvents lblAccountNumber As System.Windows.Forms.Label
    Friend WithEvents lblPassword As System.Windows.Forms.Label
    Friend WithEvents lblUsername As System.Windows.Forms.Label
    Friend WithEvents txtVersion As System.Windows.Forms.TextBox
    Friend WithEvents txtAccountEntity As System.Windows.Forms.TextBox
    Friend WithEvents txtAccountCountryCode As System.Windows.Forms.TextBox
    Friend WithEvents txtAccountPin As System.Windows.Forms.TextBox
    Friend WithEvents txtAccountNumber As System.Windows.Forms.TextBox
    Friend WithEvents txtPassword As System.Windows.Forms.TextBox
    Friend WithEvents txtUsername As System.Windows.Forms.TextBox
    Friend WithEvents gcTransaction As System.Windows.Forms.GroupBox
    Friend WithEvents lblReference5 As System.Windows.Forms.Label
    Friend WithEvents lblReference4 As System.Windows.Forms.Label
    Friend WithEvents lblReference3 As System.Windows.Forms.Label
    Friend WithEvents lblReference2 As System.Windows.Forms.Label
    Friend WithEvents lblReference1 As System.Windows.Forms.Label
    Friend WithEvents txtReference5 As System.Windows.Forms.TextBox
    Friend WithEvents txtReference4 As System.Windows.Forms.TextBox
    Friend WithEvents txtReference3 As System.Windows.Forms.TextBox
    Friend WithEvents txtReference2 As System.Windows.Forms.TextBox
    Friend WithEvents txtReference1 As System.Windows.Forms.TextBox
    Friend WithEvents gcWaybillInformation As System.Windows.Forms.GroupBox
    Friend WithEvents lblProductGroup As System.Windows.Forms.Label
    Friend WithEvents txtProductGroup As System.Windows.Forms.TextBox
    Friend WithEvents lblShipmentNumber As System.Windows.Forms.Label
    Friend WithEvents txtShipmentNumber As System.Windows.Forms.TextBox
    Friend WithEvents gcLabelInfo As System.Windows.Forms.GroupBox
    Friend WithEvents rbReportAsFile As System.Windows.Forms.RadioButton
    Friend WithEvents rbReportAsURL As System.Windows.Forms.RadioButton
    Friend WithEvents lblReportID As System.Windows.Forms.Label
    Friend WithEvents nudReportID As System.Windows.Forms.NumericUpDown
    Friend WithEvents btnReset As System.Windows.Forms.Button
    Friend WithEvents btnSubmitRequest As System.Windows.Forms.Button
    Friend WithEvents lblOrigin As System.Windows.Forms.Label
    Friend WithEvents txtOriginEntity As System.Windows.Forms.TextBox
End Class
