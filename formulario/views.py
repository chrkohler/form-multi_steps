from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from reportlab.pdfgen import canvas
from io import BytesIO
import json

@ensure_csrf_cookie
def service_view(request):
    # Obtener los datos del formulario de la sesión
    form_data = request.session.get('form_data', {})

    # Asegurar que todos los campos necesarios estén presentes
    default_data = {
        'name': '',
        'email': '',
        'phone': '',
        'company': '',
        'activity_date': '',
        'start': '',
        'end': '',
        'product_opt': '',
        'selectedMainServices': [],
        'selectedSubServices': [],
        'observations': ''
    }

    # Si los datos vienen como string JSON, convertirlos a diccionario
    if isinstance(form_data, str):
        try:
            form_data = json.loads(form_data)
        except json.JSONDecodeError:
            form_data = {}

    # Combinar los datos por defecto con los datos del formulario
    data = {**default_data, **form_data}

    context = {
        'data': json.dumps(data),
        'csrf_token': get_token(request)
    }

    return render(request, 'service-view.html', context)

def submit_form(request):
    if request.method == 'POST':
        try:
            # Si los datos vienen como JSON en el body
            if request.content_type == 'application/json':
                form_data = json.loads(request.body)
            else:
                # Si los datos vienen como POST normal
                form_data = request.POST.dict()

            # Asegurar que los arrays se manejen correctamente
            if 'selectedMainServices' in form_data and isinstance(form_data['selectedMainServices'], str):
                form_data['selectedMainServices'] = json.loads(form_data['selectedMainServices'])
            if 'selectedSubServices' in form_data and isinstance(form_data['selectedSubServices'], str):
                form_data['selectedSubServices'] = json.loads(form_data['selectedSubServices'])

            # Guardar en sesión
            request.session['form_data'] = form_data
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Datos inválidos'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

@csrf_exempt  # Solo para pruebas, remover en producción
@require_http_methods(["POST"])
def download_pdf(request):
    try:
        # Obtener los datos del body
        data = json.loads(request.body)

        # Aquí va la lógica para generar el PDF
        from reportlab.pdfgen import canvas

        # Crear el PDF en memoria
        buffer = BytesIO()
        p = canvas.Canvas(buffer)

        # Agregar contenido al PDF
        y = 800  # Posición inicial en Y
        p.drawString(100, y, "SOLICITUD DE SERVICIOS")
        y -= 20
        p.drawString(100, y, f"Solicitante: {data.get('applicant', '')}")
        y -= 20
        p.drawString(100, y, f"Email: {data.get('email', '')}")
        y -= 20
        p.drawString(100, y, f"Teléfono: {data.get('contact', '')}")

        # Finalizar el PDF
        p.showPage()
        p.save()

        # Preparar la respuesta
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="solicitud_servicios.pdf"'

        return response

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Datos inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def send_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Aquí iría la lógica para enviar el email
            return JsonResponse({'status': 'success', 'message': 'Email enviado correctamente'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Datos inválidos'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)