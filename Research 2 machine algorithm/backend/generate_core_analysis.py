from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from datetime import datetime
import os

def generate_core_analysis_pdf():
    filename = "Sentinel_Core_Technical_Analysis.pdf"
    doc = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Custom Styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=26,
        textColor=colors.HexColor('#ff003c'),
        spaceAfter=10,
        alignment=1
    )
    
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.grey,
        alignment=1,
        spaceAfter=30
    )

    header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#00a651'),
        spaceBefore=20,
        spaceAfter=12,
        borderPadding=5,
        leading=22
    )

    sub_header_style = ParagraphStyle(
        'SubHeader',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#ff00ff'),
        spaceBefore=15,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        alignment=4 # Justified
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        textColor=colors.HexColor('#2b2b2b'),
        leftIndent=20,
        rightIndent=20,
        backColor=colors.HexColor('#f0f0f0'),
        borderPadding=10
    )

    # PAGE 1: EXECUTIVE OVERVIEW
    elements.append(Paragraph("SENTINEL CORE", title_style))
    elements.append(Paragraph("A Deep-Dive into Distributed Self-Correcting ML Architectures", subtitle_style))
    elements.append(Spacer(1, 0.2*inch))

    elements.append(Paragraph("I. THE KAFKA PIPELINE BACKBONE", header_style))
    elements.append(Paragraph(
        "At its core, Sentinel is not a monolithic application; it is a distributed stream-processing engine. "
        "The system utilizes Apache Kafka as a high-throughput message broker to decouple data producers from the AI detection layers. "
        "This architecture allows for asynchronous, non-blocking processing of millions of transactions per second.", body_style))
    
    elements.append(Paragraph("Key Pipeline Components:", sub_header_style))
    pipeline_data = [
        ['Stage', 'Function', 'Technology'],
        ['Ingress (Raw)', 'Live data ingestion from blockchain nodes', 'Kafka Producer'],
        ['Analysis (Kernel)', 'Real-time hazard assessment via ML Ensemble', 'FastAPI / Sklearn'],
        ['Verification', 'Quantum-safe cryptographic ground-truth signal', 'Lattice-based Sim'],
        ['Egress (Processed)', 'Finalized ledger state sync and UI broadcast', 'Kafka Consumer / WS']
    ]
    t = Table(pipeline_data, colWidths=[1.2*inch, 2.8*inch, 2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ff003c')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
    ]))
    elements.append(t)

    elements.append(Paragraph("II. THE SELF-CORRECTING ML MANIFOLD", header_style))
    elements.append(Paragraph(
        "The AI Engine employs a GANs-inspired methodology specifically designed for adversarial evasion. "
        "Unlike traditional rule-based filters, Sentinel uses an ensemble of Unsupervised Isolation Forests.", body_style))
    
    elements.append(Paragraph("Unsupervised Learning Paradigm:", sub_header_style))
    elements.append(Paragraph(
        "By avoiding hard-coded 'if-else' statements, the engine detects anomalies based on multidimensional vector distance. "
        "The system maintains a 4D feature vector per transaction: [Log-Normalized Amount, Temporal Arrival, Hash Entropy, and Fee Sensitivity].", body_style))

    elements.append(Paragraph("The Recursive Correction Loop:", sub_header_style))
    elements.append(Paragraph(
        "When the 'Quantum Verification' signal reveals a detection error, the system executes a mathematical gradient shift. "
        "The sensitivity bias is adjusted in real-time, effectively allowing the AI to 'learn' from its mistakes without a full retrain.", body_style))

    elements.append(PageBreak())

    # PAGE 2: ADVERSARIAL DEFENSE & PRODUCTION
    elements.append(Paragraph("III. ADVERSARIAL ECOLOGY (CHAOS MODE)", header_style))
    elements.append(Paragraph(
        "To maintain highest fidelity, we implement a 'Chaos Injection' system. This generator synthesizes 'Shadow Shift' attacks— "
        "threats designed to perfectly mimic legitimate traffic. By purposefully tricking the AI, we force the self-correction counters to move, "
        "providing the continuous feedback signal required for the AI manifold to evolve.", body_style))

    elements.append(Paragraph("IV. PRODUCTION LAYER ENCAPSULATION", header_style))
    elements.append(Paragraph(
        "To move from a research simulation to a real-world enterprise product, Sentinel is designed to be wrapped in three distinct layers:", body_style))

    elements.append(Paragraph("1. THE NATIVE RUNTIME (ELECTRON)", sub_header_style))
    elements.append(Paragraph(
        "The Command Center UI is encapsulated within an <b>Electron wrapper</b>. This allows for cross-platform (.exe, .dmg) downloads. "
        "The Python backend runs as a localized 'Sidecar' binary, allowing offline analysis or hardware-accelerated processing.", body_style))

    elements.append(Paragraph("2. THE ENTERPRISE MIDDLEWARE (DOCKER)", sub_header_style))
    elements.append(Paragraph(
        "In a live banking or exchange environment, the AI Core is deployed as a <b>Dockerized Microservice</b>. "
        "It sits between the transaction mempool and the finalized block, acting as an 'Intelligent Middleware' that can halt "
        "suspicious flows قبل they settle.", body_style))

    elements.append(Paragraph("3. THE MOBILE ALERT SYSTEM (PWA/PUSH)", sub_header_style))
    elements.append(Paragraph(
        "By utilizing Service Workers and the Push API, the frontend acts as a Progressive Web App (PWA). "
        "Compliance officers can receive instant push notifications on any mobile device when a high-risk anomaly is detected.", body_style))

    elements.append(Spacer(1, 0.4*inch))
    elements.append(Paragraph("V. CORE VISION FOR JUDGES", header_style))
    elements.append(Paragraph(
        "Sentinel represents the next generation of financial security: A system that doesn't just block known threats, "
        "but autonomously adapts to unknown adversarial patterns through distributed feedback loops. Its architecture "
        "is built on the industry-standard Kafka backbone, making it live-ready for global financial infrastructure.", body_style))

    # Build PDF
    doc.build(elements)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    generate_core_analysis_pdf()
