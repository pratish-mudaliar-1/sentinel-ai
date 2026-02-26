from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.units import inch
from datetime import datetime
import os

def generate_roadmap_pdf():
    filename = "Sentinel_RealWorld_Roadmap.pdf"
    doc = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Custom Styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#ff003c'),
        spaceAfter=20,
        alignment=1
    )
    
    header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#00a651'),
        spaceBefore=15,
        spaceAfter=10
    )

    body_style = styles['Normal']
    body_style.fontSize = 11
    body_style.leading = 14

    highlight_style = ParagraphStyle(
        'Highlight',
        parent=styles['Normal'],
        fontName='Helvetica-BoldOblique',
        textColor=colors.HexColor('#ff00ff'),
        leftIndent=20
    )

    # Content
    elements.append(Paragraph("SENTINEL CORE: REAL-WORLD IMPLEMENTATION STRATEGY", title_style))
    elements.append(Paragraph(f"Project Technical Roadmap | Generated: {datetime.now().strftime('%Y-%m-%d')}", styles['Normal']))
    elements.append(Spacer(1, 0.4*inch))

    # Introduction
    elements.append(Paragraph("This document outlines the transition path from the current research-based simulation to a scalable, cross-platform production environment.", body_style))
    
    # Section 1
    elements.append(Paragraph("1. The Application Layer (Cross-Platform Deployment)", header_style))
    elements.append(Paragraph("To transform Sentinel into a downloadable application across all user devices, we utilize specialized software wrappers:", body_style))
    
    list_items = [
        ListItem(Paragraph("<b>Desktop (Windows/Mac/Linux):</b> Integration via <b>Electron</b>. This converts the dashboard into a native executable while running the Python ML engine as a background 'Sidecar' process.", body_style)),
        ListItem(Paragraph("<b>Mobile (iOS/Android):</b> Transformation into a <b>Progressive Web App (PWA)</b> or wrapping with <b>Capacitor</b>. This enables native features like Push Notifications for instant 'High-Risk' alerts.", body_style))
    ]
    elements.append(ListFlowable(list_items, bulletType='bullet'))

    # Section 2
    elements.append(Paragraph("2. Real-World Connectivity (The Data Switch)", header_style))
    elements.append(Paragraph("Moving from simulation to the real world involves hot-swapping our 'Data Ingress' layer:", body_style))
    
    list_items2 = [
        ListItem(Paragraph("<b>Direct Blockchain Ingress:</b> Replacing synthetic generators with live nodes (e.g., Alchemy, Infura, or Bitcoin Core). Our Kafka pipeline is designed to ingest live Mempool data without restructuring.", body_style)),
        ListItem(Paragraph("<b>Architecture:</b> Hosting the ML Brain in <b>Docker Containers</b> on Kubernetes (AWS/Azure) to handle massive horizontal scaling during peak network traffic.", body_style))
    ]
    elements.append(ListFlowable(list_items2, bulletType='bullet'))

    # Section 3
    elements.append(Paragraph("3. The SaaS Hierarchy", header_style))
    elements.append(Paragraph("A tiered approach ensures both performance and accessibility:", body_style))
    
    list_items3 = [
        ListItem(Paragraph("<b>The Edge:</b> Lightweight native apps for visualization.", body_style)),
        ListItem(Paragraph("<b>The Intelligence:</b> FastAPI & ML Core performing complex manifold analysis in the cloud.", body_style)),
        ListItem(Paragraph("<b>The Ledger:</b> Distributed Kafka clusters managing high-velocity data flow.", body_style))
    ]
    elements.append(ListFlowable(list_items3, bulletType='bullet'))

    elements.append(Spacer(1, 0.4*inch))
    
    # The Pitch
    elements.append(Paragraph("EXECUTIVE PITCH SUMMARY", styles['Heading3']))
    pitch_text = "<i>'Sentinel is built on a Cloud-Native architecture. While today's demo showcases a digital twin simulation, the system is engineered specifically for scalability. By moving the Kafka clusters to the cloud and wrapping the dashboard in an Electron layer, we deliver a production-ready Security Firewall capable of protecting millions of transactions in real-time.'</i>"
    elements.append(Paragraph(pitch_text, highlight_style))

    # Build PDF
    doc.build(elements)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    generate_roadmap_pdf()
