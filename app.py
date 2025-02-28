import sys
print("Python path:", sys.path)
print("Python version:", sys.version)

from flask import Flask, render_template, request, send_file, jsonify
from formulario.routes import main
from formulario.utils.pdf_generator import generate_pdf
import os
from datetime import timedelta

app = Flask(__name__, 
    static_folder='formulario/static',
    template_folder='formulario/templates',
    static_url_path='/static'
)

# Configurar una clave secreta segura
app.config['SECRET_KEY'] = os.urandom(24)
# Configurar la sesión para que sea permanente
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SESSION_TYPE'] = 'filesystem'

# Registrar el blueprint
app.register_blueprint(main)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download-pdf/', methods=['POST'])
def download_pdf():
    try:
        # Obtener los datos del request
        data = request.get_json()
        
        # Generar el PDF usando el generador existente
        pdf_path = generate_pdf(data)
        
        if not pdf_path or not os.path.exists(pdf_path):
            raise Exception("Error al generar el PDF")
            
        # Enviar el archivo como respuesta
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=os.path.basename(pdf_path)
        )
        
    except Exception as e:
        print(f"Error generando PDF: {str(e)}")
        return jsonify({'error': 'Error al generar el PDF'}), 500
    finally:
        # Limpiar el archivo temporal después de enviarlo
        if 'pdf_path' in locals() and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except Exception as e:
                print(f"Error eliminando archivo temporal: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)
