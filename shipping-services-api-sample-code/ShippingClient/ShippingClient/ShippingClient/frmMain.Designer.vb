<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmMain
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
        Me.lblCreateShipments = New System.Windows.Forms.Label()
        Me.lblPrintLabel = New System.Windows.Forms.Label()
        Me.lblExit = New System.Windows.Forms.Label()
        Me.lblCreatePickup = New System.Windows.Forms.Label()
        Me.btnCreatePickup = New System.Windows.Forms.Button()
        Me.btnExit = New System.Windows.Forms.Button()
        Me.btnPrintLabel = New System.Windows.Forms.Button()
        Me.btnCreateShipments = New System.Windows.Forms.Button()
        Me.lblCancelPickup = New System.Windows.Forms.Label()
        Me.btnCancelPickup = New System.Windows.Forms.Button()
        Me.SuspendLayout()
        '
        'lblCreateShipments
        '
        Me.lblCreateShipments.AutoSize = True
        Me.lblCreateShipments.Font = New System.Drawing.Font("Microsoft Sans Serif", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCreateShipments.Location = New System.Drawing.Point(70, 20)
        Me.lblCreateShipments.Name = "lblCreateShipments"
        Me.lblCreateShipments.Size = New System.Drawing.Size(183, 25)
        Me.lblCreateShipments.TabIndex = 1
        Me.lblCreateShipments.Text = "Create Shipments"
        '
        'lblPrintLabel
        '
        Me.lblPrintLabel.AutoSize = True
        Me.lblPrintLabel.Font = New System.Drawing.Font("Microsoft Sans Serif", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblPrintLabel.Location = New System.Drawing.Point(70, 67)
        Me.lblPrintLabel.Name = "lblPrintLabel"
        Me.lblPrintLabel.Size = New System.Drawing.Size(115, 25)
        Me.lblPrintLabel.TabIndex = 3
        Me.lblPrintLabel.Text = "Print Label"
        '
        'lblExit
        '
        Me.lblExit.AutoSize = True
        Me.lblExit.Font = New System.Drawing.Font("Microsoft Sans Serif", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblExit.Location = New System.Drawing.Point(70, 208)
        Me.lblExit.Name = "lblExit"
        Me.lblExit.Size = New System.Drawing.Size(48, 25)
        Me.lblExit.TabIndex = 9
        Me.lblExit.Text = "Exit"
        '
        'lblCreatePickup
        '
        Me.lblCreatePickup.AutoSize = True
        Me.lblCreatePickup.Font = New System.Drawing.Font("Microsoft Sans Serif", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCreatePickup.Location = New System.Drawing.Point(70, 114)
        Me.lblCreatePickup.Name = "lblCreatePickup"
        Me.lblCreatePickup.Size = New System.Drawing.Size(147, 25)
        Me.lblCreatePickup.TabIndex = 5
        Me.lblCreatePickup.Text = "Create Pickup"
        '
        'btnCreatePickup
        '
        Me.btnCreatePickup.Image = Global.ShippingClient.My.Resources.Resources._1306757232_tow_truck
        Me.btnCreatePickup.Location = New System.Drawing.Point(12, 106)
        Me.btnCreatePickup.Name = "btnCreatePickup"
        Me.btnCreatePickup.Size = New System.Drawing.Size(42, 41)
        Me.btnCreatePickup.TabIndex = 4
        Me.btnCreatePickup.UseVisualStyleBackColor = True
        '
        'btnExit
        '
        Me.btnExit.Image = Global.ShippingClient.My.Resources.Resources._1304836018_exit
        Me.btnExit.Location = New System.Drawing.Point(12, 200)
        Me.btnExit.Name = "btnExit"
        Me.btnExit.Size = New System.Drawing.Size(42, 41)
        Me.btnExit.TabIndex = 8
        Me.btnExit.UseVisualStyleBackColor = True
        '
        'btnPrintLabel
        '
        Me.btnPrintLabel.Image = Global.ShippingClient.My.Resources.Resources._1304582222_marked_price
        Me.btnPrintLabel.Location = New System.Drawing.Point(12, 59)
        Me.btnPrintLabel.Name = "btnPrintLabel"
        Me.btnPrintLabel.Size = New System.Drawing.Size(42, 41)
        Me.btnPrintLabel.TabIndex = 2
        Me.btnPrintLabel.UseVisualStyleBackColor = True
        '
        'btnCreateShipments
        '
        Me.btnCreateShipments.Image = Global.ShippingClient.My.Resources.Resources._1304582255_box
        Me.btnCreateShipments.Location = New System.Drawing.Point(12, 12)
        Me.btnCreateShipments.Name = "btnCreateShipments"
        Me.btnCreateShipments.Size = New System.Drawing.Size(42, 41)
        Me.btnCreateShipments.TabIndex = 0
        Me.btnCreateShipments.UseVisualStyleBackColor = True
        '
        'lblCancelPickup
        '
        Me.lblCancelPickup.AutoSize = True
        Me.lblCancelPickup.Font = New System.Drawing.Font("Microsoft Sans Serif", 15.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCancelPickup.Location = New System.Drawing.Point(70, 161)
        Me.lblCancelPickup.Name = "lblCancelPickup"
        Me.lblCancelPickup.Size = New System.Drawing.Size(150, 25)
        Me.lblCancelPickup.TabIndex = 7
        Me.lblCancelPickup.Text = "Cancel Pickup"
        '
        'btnCancelPickup
        '
        Me.btnCancelPickup.Image = Global.ShippingClient.My.Resources.Resources._1307341992_diagram_v2_32
        Me.btnCancelPickup.Location = New System.Drawing.Point(12, 153)
        Me.btnCancelPickup.Name = "btnCancelPickup"
        Me.btnCancelPickup.Size = New System.Drawing.Size(42, 41)
        Me.btnCancelPickup.TabIndex = 6
        Me.btnCancelPickup.UseVisualStyleBackColor = True
        '
        'frmMain
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(378, 245)
        Me.Controls.Add(Me.lblCancelPickup)
        Me.Controls.Add(Me.btnCancelPickup)
        Me.Controls.Add(Me.lblCreatePickup)
        Me.Controls.Add(Me.btnCreatePickup)
        Me.Controls.Add(Me.lblExit)
        Me.Controls.Add(Me.btnExit)
        Me.Controls.Add(Me.lblPrintLabel)
        Me.Controls.Add(Me.btnPrintLabel)
        Me.Controls.Add(Me.lblCreateShipments)
        Me.Controls.Add(Me.btnCreateShipments)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.MaximizeBox = False
        Me.Name = "frmMain"
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen
        Me.Text = "Shipping API - Shipping Client"
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents btnCreateShipments As System.Windows.Forms.Button
    Friend WithEvents lblCreateShipments As System.Windows.Forms.Label
    Friend WithEvents btnPrintLabel As System.Windows.Forms.Button
    Friend WithEvents lblPrintLabel As System.Windows.Forms.Label
    Friend WithEvents btnExit As System.Windows.Forms.Button
    Friend WithEvents lblExit As System.Windows.Forms.Label
    Friend WithEvents btnCreatePickup As System.Windows.Forms.Button
    Friend WithEvents lblCreatePickup As System.Windows.Forms.Label
    Friend WithEvents lblCancelPickup As System.Windows.Forms.Label
    Friend WithEvents btnCancelPickup As System.Windows.Forms.Button
End Class
