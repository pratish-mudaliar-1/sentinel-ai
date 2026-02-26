from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import os

def generate_credentials_pdf():
    file_path = "Sentinel_Access_Credentials.pdf"
    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#00d4ff"),
        alignment=1,
        spaceAfter=30
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.gray,
        alignment=1,
        spaceAfter=20
    )

    elements = []

    # Title
    elements.append(Paragraph("SENTINEL CORE | ACCESS CONTROL", title_style))
    elements.append(Paragraph("Authorized Personnel Credential Matrix", header_style))
    elements.append(Spacer(1, 0.5 * inch))

    # Credential Data
    data = [
        ["USERNAME", "PASSWORD", "ROLE", "ACCESS LEVEL"],
        ["admin", "admin123", "Administrator", "FULL ACCESS"],
        ["root", "toor", "Root Admin", "SYSTEM ROOT"],
        ["sentinel_lead", "lead", "Lead Architect", "FULL ACCESS"],
        ["judge", "presentation2026", "Judge Panel", "ADMIN (PRESENTATION)"],
        ["analyst", "analyst123", "Security Analyst", "READ/WRITE (ML OPS)"],
        ["fraud_ops", "fraud", "Fraud Operations", "READ/WRITE (ML OPS)"],
        ["net_sec", "secure", "Network Sec", "ANALYST"],
        ["threat_hunter", "hunt", "Threat Hunter", "ANALYST"],
        ["ai_engineer", "brain", "AI Engineer", "ANALYST"],
        ["viewer", "viewer123", "Audit Observer", "READ ONLY"],
        ["auditor", "audit", "Compliance Audit", "READ ONLY"],
        ["guest", "guest", "Guest User", "RESTRICTED"],
        ["observer", "watch", "Remote Observer", "RESTRICTED"],
        ["client", "client", "External Client", "RESTRICTED"],
    ]

    # Table Setup
    table = Table(data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#002a3d")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#00d4ff")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f0faff")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#00d4ff")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fdff")]),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 1 * inch))

    # Master Key Info
    master_style = ParagraphStyle(
        'MasterStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor("#ff003c"),
        alignment=1,
        borderWidth=1,
        borderColor=colors.HexColor("#ff003c"),
        borderPadding=10,
        backColor=colors.HexColor("#fff5f6")
    )
    
    elements.append(Paragraph("<b>EMERGENCY MASTER BYPASS KEY</b>", master_style))
    elements.append(Spacer(1, 0.1 * inch))
    elements.append(Paragraph("SENTINEL_2026_BYPASS", ParagraphStyle('Key', parent=styles['Normal'], fontSize=16, alignment=1, textColor=colors.black)))
    elements.append(Spacer(1, 0.5 * inch))
    
    footer_text = "CONFIDENTIAL - SENTINEL AI INTERNAL ACCESS CONTROL DOCUMENT"
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=1, textColor=colors.gray)))

    doc.build(elements)
    print(f"✅ Credentials PDF generated at: {os.path.abspath(file_path)}")

if __name__ == "__main__":
    generate_credentials_pdf()
