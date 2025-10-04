<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmCancelPickupCallResponse
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
        Me.tvResponse = New System.Windows.Forms.TreeView()
        Me.btnExit = New System.Windows.Forms.Button()
        Me.SuspendLayout()
        '
        'tvResponse
        '
        Me.tvResponse.LabelEdit = True
        Me.tvResponse.Location = New System.Drawing.Point(12, 9)
        Me.tvResponse.Name = "tvResponse"
        Me.tvResponse.ShowNodeToolTips = True
        Me.tvResponse.Size = New System.Drawing.Size(410, 387)
        Me.tvResponse.TabIndex = 4
        '
        'btnExit
        '
        Me.btnExit.Location = New System.Drawing.Point(347, 402)
        Me.btnExit.Name = "btnExit"
        Me.btnExit.Size = New System.Drawing.Size(75, 23)
        Me.btnExit.TabIndex = 5
        Me.btnExit.Text = "Exit"
        Me.btnExit.UseVisualStyleBackColor = True
        '
        'frmCancelPickupCallResponse
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(434, 434)
        Me.Controls.Add(Me.btnExit)
        Me.Controls.Add(Me.tvResponse)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.MaximizeBox = False
        Me.MinimizeBox = False
        Me.Name = "frmCancelPickupCallResponse"
        Me.ShowInTaskbar = False
        Me.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent
        Me.Text = "Call Response"
        Me.ResumeLayout(False)

    End Sub
    Friend WithEvents tvResponse As System.Windows.Forms.TreeView
    Friend WithEvents btnExit As System.Windows.Forms.Button
End Class
