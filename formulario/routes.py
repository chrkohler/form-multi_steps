from flask import Blueprint, render_template, request, redirect, url_for, session, send_file, make_response, jsonify, current_app
from flask import session, redirect, url_for
from datetime import datetime, timedelta
from .utils.pdf_generator import generate_pdf
from urllib.parse import unquote
import pdfkit
import os
import json
from datetime import datetime
import tempfile
from flask_wtf.csrf import CSRFProtect
import uuid
from flask_wtf.csrf import generate_csrf
from jinja2 import Template
from babel.dates import format_date
import locale
import calendar

main = Blueprint('main', __name__)
csrf = CSRFProtect()

@main.route('/submit-form', methods=['POST'])
def submit_form():
    try:
        data = request.get_json()
        print("Datos recibidos en submit_form:", data)

        # Base de datos de respuesta
        response_data = {
            'product_opt': data.get('product_opt'),
            'start_date': data.get('start_date') or data.get('activity_date'),  # Asegurar que tengamos una fecha
            'end_date': data.get('end_date'),
            'start': data.get('start'),
            'end': data.get('end'),
            'applicant': data.get('applicant'),
            'email': data.get('email'),
            'contact': data.get('contact'),
            'department': data.get('department'),
            'activity_name': data.get('activity_name'),
            'activity_location': data.get('activity_location'),
            'selectedMainServices': data.get('selectedMainServices', []),
            'selectedSubServices': data.get('selectedSubServices', []),
            'observations': data.get('observations'),
            'activity_details': data.get('activity_details'),
            'id': str(uuid.uuid4())[:8].upper()  # Generar un ID único para el folio
        }

        # Manejar datos específicos según el tipo de recurrencia
        if data.get('product_opt') == 'recurrente':
            response_data.update({
                'recurrenceType': data.get('recurrenceType'),
                'selectedWeekdays': data.get('selectedWeekdays', []),
                'monthWeek': data.get('monthWeek'),
                'selectedMonthDay': data.get('selectedMonthDay')
            })

        # Guardar en la sesión
        session['form_data'] = response_data
        print("Datos guardados en sesión:", session['form_data'])

        return jsonify({
            'success': True,
            'view_url': url_for('main.view_service'),
            'data': response_data
        })

    except Exception as e:
        print("Error en submit_form:", str(e))
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@main.route('/')
def index():
    # Obtener datos de la sesión si estamos editando
    form_data = {}
    edit_mode = request.args.get('edit')
    data_param = request.args.get('data')

    if edit_mode:
        try:
            if data_param:
                # Decodificar y parsear los datos de la URL
                form_data = json.loads(unquote(data_param))
            else:
                # Si no hay datos en la URL, usar datos de la sesión
                form_data = session.get('form_data', {})

            # Asegurarse de que los datos estén en el formato correcto
            if form_data:
                # Convertir listas a strings JSON para el formulario si es necesario
                if 'selectedMainServices' in form_data:
                    if isinstance(form_data['selectedMainServices'], list):
                        form_data['selectedMainServices'] = json.dumps(form_data['selectedMainServices'])
                if 'selectedSubServices' in form_data:
                    if isinstance(form_data['selectedSubServices'], list):
                        form_data['selectedSubServices'] = json.dumps(form_data['selectedSubServices'])
                
                # Establecer el tipo de actividad
                if 'product_opt' in form_data:
                    form_data['isRecurrent'] = form_data['product_opt'] == 'Actividad Recurrente'
                
                # Asegurarse de que todos los campos necesarios existan
                default_fields = {
                    'activity_name': '',
                    'activity_location': '',
                    'activity_date': '',
                    'start_date': '',
                    'end_date': '',
                    'start': '',
                    'end': '',
                    'recurrence': '',
                    'department': '',
                    'applicant': '',
                    'email': '',
                    'contact': '',
                    'observations': '',
                    'authorization': '',
                    'selectedMainServices': '[]',
                    'selectedSubServices': '[]'
                }
                
                # Añadir campos faltantes con valores por defecto
                for field, default_value in default_fields.items():
                    if field not in form_data:
                        form_data[field] = default_value

                # Guardar en la sesión para mantener consistencia
                session['form_data'] = form_data
        except Exception as e:
            print(f"Error procesando datos del formulario: {str(e)}")
            form_data = {}
    else:
        # Para formularios nuevos
        form_data = {
            'request_date': datetime.now().strftime('%Y-%m-%d'),
            'selectedMainServices': '[]',
            'selectedSubServices': '[]',
            'isRecurrent': False
        }

    return render_template('index.html', form_data=form_data)

@main.route('/save-form', methods=['POST'])
def save_form():
    try:
        if not request.is_json:
            return jsonify({'error': 'Se requiere JSON'}), 400
            
        form_data = request.get_json()
        print("Datos recibidos en save-form:", json.dumps(form_data, indent=2))
        
        # Asegurar que isRecurrent y product_opt estén correctamente establecidos
        is_recurrent = form_data.get('product_opt') == 'recurrente'
        form_data['isRecurrent'] = is_recurrent
        form_data['product_opt'] = 'recurrente' if is_recurrent else 'unica'
        
        # Guardar en sesión
        session['form_data'] = form_data
        print("Datos guardados en sesión:", json.dumps(session['form_data'], indent=2))
        
        return jsonify({'success': True})
    except Exception as e:
        print("Error en save-form:", str(e))
        return jsonify({'error': str(e)}), 500

@main.route('/view-service')
def view_service():
    form_data = session.get('form_data', {})
    
    # Asegurarse de que start_date tenga un valor
    if not form_data.get('start_date'):
        form_data['start_date'] = form_data.get('activity_date')
    
    return render_template(
        'service-view.html',
        data=form_data
    )

@main.route('/download-pdf')
def download_pdf():
    try:
        form_data = session.get('form_data')
        if not form_data:
            return "No data available", 400

        # Generate filename with current date
        current_date = datetime.now().strftime('%Y-%m-%d')
        filename = f"{current_date}_Solicitud-Servicios.pdf"

        # Generate PDF directly with the correct filename
        pdf_path = generate_pdf(form_data)

        if not os.path.exists(pdf_path):
            return "PDF file not found", 404

        # Send file to client
        response = send_file(
            pdf_path,
            as_attachment=True,
            download_name=filename
        )

        # Clean up the file after sending
        @response.call_on_close
        def cleanup():
            try:
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            except Exception as e:
                current_app.logger.error(f"Error cleaning up PDF file: {str(e)}")

        return response

    except Exception as e:
        print(f"Error in download_pdf: {str(e)}")
        return str(e), 500

@main.route('/send-email')
def send_email():
    form_data = session.get('form_data', {})
    try:
        # Aquí iría la lógica de envío de correo
        # Por ahora solo retornamos un mensaje de éxito
        return jsonify({'status': 'success', 'message': 'Email enviado correctamente'})
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@main.route('/get-form-data')
def get_form_data():
    try:
        form_data = session.get('form_data', {})
        return jsonify(form_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_daily_dates(start_date, end_date):
    """Genera una lista de fechas para actividades diarias."""
    if not start_date or not end_date:
        return []
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        dates = []
        current = start
        
        while current <= end:
            dates.append(current.strftime('%Y-%m-%d'))
            current += timedelta(days=1)
            
        return dates
    except Exception as e:
        print(f"Error generando fechas diarias: {str(e)}")
        return []

def get_weekly_dates(start_date, end_date, selected_weekdays):
    """Genera una lista de fechas para actividades semanales."""
    if not start_date or not end_date or not selected_weekdays:
        return []
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        dates = []
        current = start
        
        # Mapeo de nombres de días a números
        days_map = {
            'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3,
            'Viernes': 4, 'Sábado': 5, 'Domingo': 6
        }
        
        # Convertir nombres de días a números
        selected_days = [days_map[day] for day in selected_weekdays if day in days_map]
        
        while current <= end:
            # calendar.weekday() retorna 0-6 (0=Lunes)
            if calendar.weekday(current.year, current.month, current.day) in selected_days:
                dates.append(current.strftime('%Y-%m-%d'))
            current += timedelta(days=1)
            
        return dates
    except Exception as e:
        print(f"Error generando fechas semanales: {str(e)}")
        return []

def get_monthly_dates(start_date, end_date, selected_day):
    """Genera una lista de fechas para actividades mensuales."""
    if not start_date or not end_date or not selected_day:
        return []
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        dates = []
        
        # Mapeo de nombres de días a números
        days_map = {
            'domingo': 6, 'lunes': 0, 'martes': 1, 'miércoles': 2,
            'jueves': 3, 'viernes': 4, 'sábado': 5
        }
        
        # Determinar qué número de semana del mes es la fecha inicial
        week_number = (start.day - 1) // 7 + 1
        
        current = start.replace(day=1)  # Inicio del mes
        
        while current <= end:
            # Encontrar la ocurrencia específica del día en el mes
            week_count = 0
            temp_date = current
            
            while temp_date.month == current.month:
                if calendar.weekday(temp_date.year, temp_date.month, temp_date.day) == days_map.get(selected_day.lower()):
                    week_count += 1
                    if week_count == week_number and start <= temp_date <= end:
                        dates.append(temp_date.strftime('%Y-%m-%d'))
                        break
                temp_date += timedelta(days=1)
            
            # Avanzar al siguiente mes
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
            
        return dates
    except Exception as e:
        print(f"Error generando fechas mensuales: {str(e)}")
        return []

def format_date(date_str, format_type='full'):
    """
    Formatea una fecha en formato legible en español.
    format_type puede ser 'full' o 'short'
    """
    if not date_str:
        return 'N/A'
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d')
        
        if format_type == 'short':
            # Formato DD-MM-YYYY
            return date.strftime('%d-%m-%Y')
        else:
            # Formato completo en español
            locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
            formatted_date = format_date(date, format='EEEE, d \'de\' MMMM \'de\' yyyy', locale='es')
            return formatted_date.lower()
    except Exception as e:
        print(f"Error formateando fecha: {str(e)}")
        return date_str
    finally:
        try:
            locale.setlocale(locale.LC_TIME, '')
        except:
            pass

@main.route('/api/download-service', methods=['POST'])
def download_service():
    try:
        data = request.get_json()
        print("Generando PDF para:", data.get('id'))  # Debug log
        
        # Definir las opciones de subservicios
        subServiceOptions = {
            'Transmisión': ['Circuito Cerrado', 'Transmisión en vivo', 'Falso en vivo', 'Audio en vivo', 'Edición en vivo'],
            'Cámara': ['Fotografía', 'Video'],
            'Uso de Instalaciones': ['Estudio de TV', 'Sala de Edición'],
            'Postproducción': ['Edición', 'Animación'],
            'Distribución': ['Plataformas digitales', 'Redes sociales']
        }
        
        html_content = render_template(
            'pdf-template.html',
            data=data,
            format_date=format_date,
            subServiceOptions=subServiceOptions,
            now=datetime.now,
            get_daily_dates=get_daily_dates,
            get_weekly_dates=get_weekly_dates,
            get_monthly_dates=get_monthly_dates
        )
        
        # Crear archivo temporal para el PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as pdf_file:
            pdf_path = pdf_file.name
        
        # Configuración actualizada de wkhtmltopdf
        options = {
            'page-size': 'Letter',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
            'disable-smart-shrinking': None,
            'print-media-type': None,
            'enable-internal-links': None,
            'enable-external-links': None,
            'javascript-delay': '1000',
            'debug-javascript': None,
            'load-error-handling': 'ignore'
        }
        
        try:
            # Generar PDF con la configuración actualizada
            pdfkit.from_string(
                html_content,
                pdf_path,
                options=options,
                verbose=True  # Habilitar logs detallados
            )
            
            print(f"PDF generado exitosamente en: {pdf_path}")  # Debug log
            
            return send_file(
                pdf_path,
                as_attachment=True,
                download_name=f"solicitud-servicio-{data.get('id', 'sin-id')}.pdf",
                mimetype='application/pdf'
            )
            
        except Exception as e:
            print(f"Error generando PDF con pdfkit: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Error general en download_service: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error generando PDF: {str(e)}'
        }), 500
        
    finally:
        # Limpiar archivo temporal
        if 'pdf_path' in locals():
            try:
                os.remove(pdf_path)
            except Exception as e:
                print(f"Error eliminando archivo temporal: {str(e)}")