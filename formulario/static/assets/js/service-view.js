document.addEventListener('DOMContentLoaded', function() {
    // Botón de descarga PDF
    const downloadBtn = document.querySelector('.btn-primary');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const modalElement = document.getElementById('confirmationModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            
            // Recoger datos del formulario
            let solicitante = document.getElementById("applicant")?.value || "Usuario";
            let correo = document.getElementById("email")?.value || "correo@ejemplo.com";
            let actividad = document.getElementById("activity_name")?.value || "Sin especificar";
            let contacto = document.getElementById("contact")?.value || "Sin especificar";

            // Construir el mailto:
            let subject = encodeURIComponent(`Solicitud | ${actividad} - ${solicitante}`);
            let body = encodeURIComponent(`Estimado equipo de Medialab, Por este medio solicito su apoyo para la actividad ${actividad}\n\n{NO OLVIDES ADJUNTAR EL ARCHIVO QUE DESCARGASTE) .\n\nSaludos,\n${solicitante}\nNum/Ext:${contacto}\n${correo}`);
            let mailtoLink = `mailto:medialab@galileo.edu?cc=dantonio@galileo.edu&subject=${subject}&body=${body}`;

            // Asignar el mailto: al botón
            let emailButton = document.getElementById("emailButton");
            emailButton.setAttribute("href", mailtoLink);

            // Construir el Mensaje para Copiar
            let emailMessage = `Estimado equipo de Medialab,\n\n` +
            `Por este medio solicito su apoyo para la actividad: ${actividad}.\n\n` +
            `{NO OLVIDES ADJUNTAR EL ARCHIVO QUE DESCARGASTE}.\n\n` +
            `Saludos,\n${solicitante}\nNum/Ext: ${contacto}\n${correo}`;

            // Guardar el mensaje en el botón de copiar
            let copyButton = document.getElementById("copyEmailButton");
            copyButton.setAttribute("data-message", emailMessage);

            modalInstance.show();
            
            // Después de mostrar el modal, iniciar la descarga
            setTimeout(() => {
                window.location.href = '/download-pdf';
            }, 500);
        });
    }

    // Botón de enviar a Medialab
    const sendBtn = document.querySelector('.btn-success');
    if (sendBtn) {
        sendBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('/send-email');
                const data = await response.json();
                
                if (data.status === 'success') {
                    alert('Correo enviado exitosamente');
                } else {
                    alert('Error al enviar el correo: ' + data.message);
                }
            } catch (error) {
                alert('Error al enviar el correo');
                console.error(error);
            }
        });
    }

    // Botón de editar
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Obtener los datos actuales
            const preData = JSON.parse(document.querySelector('pre').textContent);
            
            // Obtener explícitamente los valores de hora
            const startTime = document.getElementById('start-time')?.textContent?.trim();
            const endTime = document.getElementById('end-time')?.textContent?.trim();
            
            const currentData = {
                ...preData,
                start: startTime || preData.start,
                end: endTime || preData.end
            };
            
            console.log('Datos a guardar:', currentData);
            console.log('Valores de hora:', { start: currentData.start, end: currentData.end });
            
            // Guardar los datos en sessionStorage
            sessionStorage.setItem('formData', JSON.stringify(currentData));
            
            // Para debug: mostrar lo que se guardó
            const savedData = JSON.parse(sessionStorage.getItem('formData'));
            console.log('Datos guardados en sessionStorage:', savedData);
            
            // Redirigir al formulario con parámetro de edición
            window.location.href = '/?edit=true';
        });
    }
});

createApp({
    delimiters: ["[[", "]]"],
    data() {
        const rawData = JSON.parse('{{ data|safe }}');
        console.log('Datos recibidos en service-view (raw):', rawData);
        
        return {
            data: rawData,
            loading: false
        };
    },
    computed: {
        calculatedDates() {
            if (!this.data.start_date || !this.data.end_date || !this.data.recurrenceType) {
                return [];
            }

            try {
                const startDate = new Date(this.data.start_date);
                const endDate = new Date(this.data.end_date);
                const allDates = new Set(); // Usar Set para evitar duplicados

                if (this.data.recurrenceType === 'semanal') {
                    // Convertir selectedWeekdays a array normal y normalizar nombres
                    const selectedDays = Array.from(this.data.selectedWeekdays).map(day => 
                        this.capitalizeFirstLetter(day)
                    );
                    console.log('Días seleccionados normalizados:', selectedDays);

                    // Crear un mapa de días en español
                    const dayMap = {
                        'Domingo': 0,
                        'Lunes': 1,
                        'Martes': 2,
                        'Miércoles': 3,
                        'Jueves': 4,
                        'Viernes': 5,
                        'Sábado': 6
                    };

                    // Obtener números de día para los días seleccionados
                    const selectedDayNumbers = selectedDays.map(day => dayMap[day]);
                    console.log('Números de días seleccionados:', selectedDayNumbers);

                    // Recorrer cada día en el rango
                    let currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        const dayNumber = currentDate.getDay();
                        if (selectedDayNumbers.includes(dayNumber)) {
                            const dateStr = this.formatDateToString(currentDate);
                            allDates.add(dateStr);
                            console.log(`Agregada fecha: ${dateStr} (${this.getDayName(currentDate)})`);
                        }
                        // Avanzar al siguiente día
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                } else if (this.data.recurrenceType === 'mensual') {
                    const weekNumber = this.getWeekOfMonth(startDate);
                    const dayName = this.getDayName(startDate);
                    let currentDate = new Date(startDate);
                    
                    while (currentDate <= endDate) {
                        if (this.getWeekOfMonth(currentDate) === weekNumber && 
                            this.getDayName(currentDate) === dayName) {
                            allDates.add(this.formatDateToString(currentDate));
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }

                // Convertir Set a array y ordenar
                const sortedDates = Array.from(allDates).sort();
                console.log('Fechas finales ordenadas:', sortedDates);
                return sortedDates;

            } catch (error) {
                console.error('Error calculando fechas:', error);
                return [];
            }
        },
        recurrencePattern() {
            if (!this.data.selectedWeekdays || !this.data.selectedWeekdays.length) return '';
            return `Todos los ${this.data.selectedWeekdays.join(' y ')}`;
        }
    },
    methods: {
        capitalizeFirstLetter(string) {
            if (!string) return '';
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        },
        formatDateToString(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        getDayName(date) {
            return date.toLocaleDateString('es-ES', { weekday: 'long' });
        },
        getWeekOfMonth(date) {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            return Math.ceil((date.getDate() + firstDay.getDay() - 1) / 7);
        },
        formatDate(dateStr) {
            try {
                const [year, month, day] = dateStr.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Error formateando fecha:', error);
                return dateStr;
            }
        }
    },
    mounted() {
        console.log('Componente montado. Estado inicial:', {
            recurrenceType: this.data.recurrenceType,
            selectedWeekdays: this.data.selectedWeekdays,
            startDate: this.data.start_date,
            calculatedDates: this.calculatedDates
        });
    }
}).mount("#app"); 