from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from datetime import datetime, timedelta
import os
import json
import tempfile

def generate_pdf(data):
    try:
        # Create a temporary directory if it doesn't exist
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'temp')
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # Generate filename with current date and full path
        current_date = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        output_filename = f"{current_date}_Solicitud-Servicios.pdf"
        output_path = os.path.join(temp_dir, output_filename)

        # Create PDF with the correct filename
        c = canvas.Canvas(output_path, pagesize=A4)
        width, height = A4

        # Add header with logos
        galileo_logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static/assets/img/galileo-logo.png')
        medialab_logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static/assets/img/medialab-logo.png')

        # Draw logos
        try:
            if os.path.exists(galileo_logo_path):
                c.drawImage(galileo_logo_path, 50, height-80, width=100, height=50, preserveAspectRatio=True)
            if os.path.exists(medialab_logo_path):
                c.drawImage(medialab_logo_path, width-150, height-80, width=100, height=50, preserveAspectRatio=True)
        except Exception as e:
            print(f"Error loading logos: {str(e)}")

        # Add title
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width/2, height-60, "SOLICITUD DE SERVICIOS")
        c.setFont("Helvetica", 14)
        c.drawCentredString(width/2, height-80, "MEDIALAB UNIVERSIDAD GALILEO")

        # Add brown box around header
        c.setStrokeColor(colors.brown)
        c.rect(40, height-100, width-80, 90)

        # Datos del Solicitante
        y_position = height - 140
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y_position, "DATOS DEL SOLICITANTE")
        c.setStrokeColor(colors.brown)
        c.line(50, y_position-5, width-50, y_position-5)

        # Add form fields
        y_position -= 30
        fields = [
            ("Fecha de Solicitud:", data.get('request_date', '')),
            ("Departamento:", data.get('department', '')),
            ("Nombre:", data.get('applicant', '')),
            ("Teléfono:", data.get('contact', '')),
            ("Correo electrónico:", data.get('email', ''))
        ]

        for label, value in fields:
            c.setFont("Helvetica-Bold", 10)
            c.drawString(50, y_position, label)
            c.setFont("Helvetica", 10)
            c.drawString(200, y_position, str(value))
            y_position -= 20

        # Datos del Evento section
        y_position -= 20
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y_position, "DATOS DEL EVENTO")
        c.setStrokeColor(colors.brown)
        c.line(50, y_position-5, width-50, y_position-5)

        y_position -= 30
        event_fields = [
            ("Nombre del Evento:", data.get('activity_name', '')),
            ("Fecha:", data.get('activity_date', '')),
            ("Hora Inicio:", data.get('start', '')),
            ("Hora Finalización:", data.get('end', '')),
            ("Ubicación:", data.get('activity_location', ''))
        ]

        for label, value in event_fields:
            c.setFont("Helvetica-Bold", 10)
            c.drawString(50, y_position, label)
            c.setFont("Helvetica", 10)

            # Format time values if they exist
            if ('Hora' in label) and value:
                try:
                    # Convert 24h to 12h format with AM/PM
                    time_obj = datetime.strptime(value, '%H:%M')
                    formatted_time = time_obj.strftime('%I:%M %p')
                    c.drawString(200, y_position, formatted_time)
                except ValueError:
                    c.drawString(200, y_position, str(value))
            else:
                c.drawString(200, y_position, str(value))

            y_position -= 20

        # Servicios Solicitados
        y_position -= 20
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y_position, "SERVICIOS SOLICITADOS")
        c.setStrokeColor(colors.brown)
        c.line(50, y_position-5, width-50, y_position-5)

        # Services Table Section
        y_position -= 30

        # Get the services from form data and ensure they're lists
        main_services = data.get('selectedMainServices', [])
        sub_services = data.get('selectedSubServices', [])

        # Convert from string to list if they're strings
        if isinstance(main_services, str):
            try:
                main_services = json.loads(main_services)
            except json.JSONDecodeError:
                main_services = []

        if isinstance(sub_services, str):
            try:
                sub_services = json.loads(sub_services)
            except json.JSONDecodeError:
                sub_services = []

        # Create a dictionary to organize sub-services by their main service
        service_mapping = {
            'Transmisión': [],
            'Cámara': [],
            'Uso de instalaciones': [],
            'Postproducción': [],
            'Distribución': []
        }

        # Map sub-services to their main services
        for sub_service in sub_services:
            if any(keyword in sub_service for keyword in ['Circuito Cerrado', 'Transmisión en Vivo', 'Falso en Vivo', 'Audio en Vivo', 'Edición en Vivo']):
                service_mapping['Transmisión'].append(sub_service)
            elif any(keyword in sub_service for keyword in ['Grabación de Vídeo', 'Fotografía', 'Entrevistas', 'Reportaje']):
                service_mapping['Cámara'].append(sub_service)
            elif any(keyword in sub_service for keyword in ['Uso de Estudio', 'Uso de Cabina']):
                service_mapping['Uso de instalaciones'].append(sub_service)
            elif any(keyword in sub_service for keyword in ['Edición de Video', 'Animaciones Gráficas', 'Subtitulado']):
                service_mapping['Postproducción'].append(sub_service)
            elif any(keyword in sub_service for keyword in ['Redes Sociales', 'Formato Digital', 'Plataforma Privada', 'Zoom', 'YouTube', 'LinkedIn', 'Facebook']):
                service_mapping['Distribución'].append(sub_service)

        # Create table data
        table_data = [["Servicio", "Servicios Adicionales"]]

        # Add services and their sub-services to the table
        for main_service in main_services:
            sub_services_text = "\n".join(service_mapping.get(main_service, []))
            if not sub_services_text:
                sub_services_text = "Ninguno"
            table_data.append([main_service, sub_services_text])

        # Create and style the table
        table = Table(table_data, colWidths=[250, 250])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        # Draw the table
        table.wrapOn(c, width-100, height)
        table.drawOn(c, 50, y_position-20)

        # Observaciones
        y_position = y_position - (len(table_data) * 20) - 40
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y_position, "OBSERVACIONES")
        c.setStrokeColor(colors.brown)
        c.line(50, y_position-5, width-50, y_position-5)

        # Add observations with word wrapping
        y_position -= 30
        c.setFont("Helvetica", 10)
        observations = data.get('observations', '')
        words = observations.split()
        line = []
        x_position = 50
        
        for word in words:
            line.append(word)
            if c.stringWidth(' '.join(line), "Helvetica", 10) > width-100:
                line.pop()
                c.drawString(x_position, y_position, ' '.join(line))
                y_position -= 15
                line = [word]
        if line:
            c.drawString(x_position, y_position, ' '.join(line))

        # Calcular fechas recurrentes si es necesario
        if data.get('product_opt') == 'recurrente':
            data['calculated_dates'] = calculate_recurring_dates(data)

        # Save PDF
        c.save()
        return output_path
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        raise

def calculate_recurring_dates(data):
    start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
    dates = []
    
    current_date = start_date
    while current_date <= end_date:
        if data['recurrenceType'] == 'diario':
            dates.append(current_date.strftime('%d de %B de %Y'))
            current_date += timedelta(days=1)
        
        elif data['recurrenceType'] == 'semanal':
            if current_date.strftime('%A').lower() in data.get('selectedWeekdays', []):
                dates.append(current_date.strftime('%d de %B de %Y'))
            current_date += timedelta(days=1)
        
        elif data['recurrenceType'] == 'mensual':
            if current_date.day == int(data.get('selectedMonthday', 0)):
                dates.append(current_date.strftime('%d de %B de %Y'))
            current_date += timedelta(days=1)
    
    return dates