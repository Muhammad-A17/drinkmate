<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmCancelPickup
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
        Me.gcPickupReference = New System.Windows.Forms.GroupBox()
        Me.lblPickupGUID = New System.Windows.Forms.Label()
        Me.txtPickupGUID = New System.Windows.Forms.TextBox()
        Me.btnReset = New System.Windows.Forms.Button()
        Me.btnSubmitRequest = New System.Windows.Forms.Button()
        Me.txtComments = New System.Windows.Forms.TextBox()
        Me.lblComments = New System.Windows.Forms.Label()
        Me.gcClientInfo.SuspendLayout()
        Me.gcTransaction.SuspendLayout()
        Me.gcPickupReference.SuspendLayout()
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
        'gcPickupReference
        '
        Me.gcPickupReference.Controls.Add(Me.lblComments)
        Me.gcPickupReference.Controls.Add(Me.txtComments)
        Me.gcPickupReference.Controls.Add(Me.lblPickupGUID)
        Me.gcPickupReference.Controls.Add(Me.txtPickupGUID)
        Me.gcPickupReference.Location = New System.Drawing.Point(12, 364)
        Me.gcPickupReference.Name = "gcPickupReference"
        Me.gcPickupReference.Size = New System.Drawing.Size(394, 99)
        Me.gcPickupReference.TabIndex = 2
        Me.gcPickupReference.TabStop = False
        Me.gcPickupReference.Text = "Pickup"
        '
        'lblPickupGUID
        '
        Me.lblPickupGUID.AutoSize = True
        Me.lblPickupGUID.Location = New System.Drawing.Point(6, 19)
        Me.lblPickupGUID.Name = "lblPickupGUID"
        Me.lblPickupGUID.Size = New System.Drawing.Size(37, 13)
        Me.lblPickupGUID.TabIndex = 0
        Me.lblPickupGUID.Text = "GUID:"
        '
        'txtPickupGUID
        '
        Me.txtPickupGUID.Location = New System.Drawing.Point(78, 15)
        Me.txtPickupGUID.MaxLength = 100
        Me.txtPickupGUID.Name = "txtPickupGUID"
        Me.txtPickupGUID.Size = New System.Drawing.Size(310, 20)
        Me.txtPickupGUID.TabIndex = 1
        '
        'btnReset
        '
        Me.btnReset.Location = New System.Drawing.Point(322, 469)
        Me.btnReset.Name = "btnReset"
        Me.btnReset.Size = New System.Drawing.Size(84, 23)
        Me.btnReset.TabIndex = 4
        Me.btnReset.Text = "Reset"
        Me.btnReset.UseVisualStyleBackColor = True
        '
        'btnSubmitRequest
        '
        Me.btnSubmitRequest.Location = New System.Drawing.Point(225, 469)
        Me.btnSubmitRequest.Name = "btnSubmitRequest"
        Me.btnSubmitRequest.Size = New System.Drawing.Size(91, 23)
        Me.btnSubmitRequest.TabIndex = 3
        Me.btnSubmitRequest.Text = "Submit Request"
        Me.btnSubmitRequest.UseVisualStyleBackColor = True
        '
        'txtComments
        '
        Me.txtComments.Location = New System.Drawing.Point(78, 41)
        Me.txtComments.MaxLength = 250
        Me.txtComments.Multiline = True
        Me.txtComments.Name = "txtComments"
        Me.txtComments.Size = New System.Drawing.Size(310, 52)
        Me.txtComments.TabIndex = 3
        '
        'lblComments
        '
        Me.lblComments.AutoSize = True
        Me.lblComments.Location = New System.Drawing.Point(6, 61)
        Me.lblComments.Name = "lblComments"
        Me.lblComments.Size = New System.Drawing.Size(59, 13)
        Me.lblComments.TabIndex = 2
        Me.lblComments.Text = "Comments:"
        '
        'frmCancelPickup
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(415, 503)
        Me.Controls.Add(Me.btnReset)
        Me.Controls.Add(Me.btnSubmitRequest)
        Me.Controls.Add(Me.gcPickupReference)
        Me.Controls.Add(Me.gcTransaction)
        Me.Controls.Add(Me.gcClientInfo)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.MaximizeBox = False
        Me.Name = "frmCancelPickup"
        Me.ShowInTaskbar = False
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent
        Me.Text = "Shipping API - Shipping Client - Pickup Cancelation Service"
        Me.gcClientInfo.ResumeLayout(False)
        Me.gcClientInfo.PerformLayout()
        Me.gcTransaction.ResumeLayout(False)
        Me.gcTransaction.PerformLayout()
        Me.gcPickupReference.ResumeLayout(False)
        Me.gcPickupReference.PerformLayout()
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
    Friend WithEvents gcPickupReference As System.Windows.Forms.GroupBox
    Friend WithEvents lblPickupGUID As System.Windows.Forms.Label
    Friend WithEvents txtPickupGUID As System.Windows.Forms.TextBox
    Friend WithEvents btnReset As System.Windows.Forms.Button
    Friend WithEvents btnSubmitRequest As System.Windows.Forms.Button
    Friend WithEvents lblComments As System.Windows.Forms.Label
    Friend WithEvents txtComments As System.Windows.Forms.TextBox
End Class
