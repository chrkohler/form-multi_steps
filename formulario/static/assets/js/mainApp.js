document.addEventListener('alpine:init', () => {
    Alpine.data('mainApp', () => ({
        step: 1,
        totalSteps: 4,
        isRecurrent: false,
        product_opt: 'unica',
        selectedTemplate: 'predeterminado',
        selectedMainServices: [],
        selectedSubServices: [],
        selectedAuthorization: '',
        recurrenceType: 'diario',
        monthWeek: 'primera',
        selectedMonthDay: 'lunes',
        weekdays: [
            { name: 'Lunes', value: 'lunes', checked: false },
            { name: 'Martes', value: 'martes', checked: false },
            { name: 'Miércoles', value: 'miércoles', checked: false },
            { name: 'Jueves', value: 'jueves', checked: false },
            { name: 'Viernes', value: 'viernes', checked: false },
            { name: 'Sábado', value: 'sábado', checked: false },
            { name: 'Domingo', value: 'domingo', checked: false }
        ],
        showWarning: false,
        startTime: '',
        endTime: '',
        selectedWeekdays: [],
        selectedWeek: '',
        selectedWeekday: '',
        activity_details: '',
        observations: '',
        department: '',
        applicant: '',
        email: '',
        contact: '',
        recurrence: '',
        monthday: '',
        request_date: '',
        timestamp: '',
        activity_name: '',
        activity_location: '',
        start: '',
        end: '',
        start_date: '',
        end_date: '',
        formErrors: [],
        showAuthError: false,
        isSubmitting: false,
        isSaving: false,
        hasUnsavedChanges: false,

        mainServices: [
            'Transmisión',
            'Cámara',
            'Uso de Instalaciones',
            'Postproducción',
            'Distribución'
        ],

        subServiceOptions: {
            'Transmisión': ['Circuito Cerrado', 'Transmisión en vivo', 'Falso en vivo', 'Audio en vivo', 'Edición en vivo'],
            'Cámara': ['Fotografía', 'Video'],
            'Uso de Instalaciones': ['Estudio de TV', 'Sala de Edición'],
            'Postproducción': ['Edición', 'Animación'],
            'Distribución': ['Plataformas digitales', 'Redes sociales']
        },

        templates: {
            cursos: {
                main: ["Transmisión", "Cámara", "Distribución", "Uso de Instalaciones"],
                sub: [
                    "Grabación de Vídeo en Estudio", 
                    "Transmisión en Vivo", 
                    "Edición en Vivo",
                    "Grabación de Vídeo",
                    "Conferencia Zoom",
                    "Live YouTube",
                    "Uso de Estudio"
                ]
            },
            cursos_u: {
                main: ["Cámara", "Transmisión", "Distribución"],
                sub: [
                    "Transmisión en Vivo", 
                    "Conferencia Zoom",
                    "Live Youtube",
                    "Grabación de Vídeo"
                ]
            },
            transmision: {
                main: ["Transmisión", "Uso de Instalaciones", "Cámara"],
                sub: [
                    "Falso en Vivo", 
                    "Circuito Cerrado", 
                    "Multi-Plataforma", 
                    "Uso de Estudio",
                    "Grabación de Vídeo",
                    "Fotografía",
                    "Reportaje",
                    "Entrevistas"
                ]
            },
            falsovivo: {
                main: ["Transmisión", "Postproducción", "Distribución"],
                sub: [
                    "Falso en Vivo", 
                    "Edición de Video", 
                    "Animaciones Gráficas", 
                    "Publicación en Redes Sociales"
                ]
            },
            webinar: {
                main: ["Transmisión", "Postproducción", "Distribución"],
                sub: [
                    "Falso en Vivo", 
                    "Edición de Video", 
                    "Animaciones Gráficas", 
                    "Publicación en Redes Sociales",
                    "Conferencia Zoom",
                    "Live Youtube"
                ]
            }
        },

        templateServices: {
            'transmision': {
                mainServices: ['Transmisión', 'Cámara'],
                subServices: ['Transmisión en vivo', 'Edición en vivo', 'Video']
            },
            'falsovivo': {
                mainServices: ['Transmisión', 'Cámara', 'Postproducción'],
                subServices: ['Falso en vivo', 'Video', 'Edición']
            },
            'evento_presencial': {
                mainServices: ['Cámara', 'Uso de Instalaciones'],
                subServices: ['Video', 'Fotografía', 'Estudio de TV']
            },
            'webinar': {
                mainServices: ['Transmisión', 'Cámara'],
                subServices: ['Transmisión en vivo', 'Video']
            },
            'cursos': {
                mainServices: ['Transmisión', 'Cámara', 'Uso de Instalaciones'],
                subServices: ['Transmisión en vivo', 'Edición en vivo', 'Video', 'Estudio de TV']
            },
            'cursos_u': {
                mainServices: ['Cámara', 'Postproducción'],
                subServices: ['Video', 'Edición']
            }
        },

        init() {
            const urlParams = new URLSearchParams(window.location.search);
            const editMode = urlParams.get('edit');
            const encodedData = urlParams.get('data');

            if (editMode && encodedData) {
                try {
                    const formData = JSON.parse(decodeURIComponent(encodedData));
                    console.log('Datos recibidos para edición:', formData);

                    // Asignar todos los valores
                    this.activity_name = formData.activity_name || '';
                    this.activity_location = formData.activity_location || '';
                    this.activity_date = formData.activity_date || '';
                    this.start = formData.start || '';
                    this.end = formData.end || '';
                    this.observations = formData.observations || '';
                    this.department = formData.department || '';
                    this.applicant = formData.applicant || '';
                    this.email = formData.email || '';
                    this.contact = formData.contact || '';
                    this.selectedAuthorization = formData.authorization || '';

                    // Tipo de actividad y recurrencia
                    this.product_opt = formData.product_opt || 'unica';
                    this.isRecurrent = formData.product_opt === 'recurrente';
                    
                    if (this.isRecurrent) {
                        this.start_date = formData.start_date || '';
                        this.end_date = formData.end_date || '';
                        this.recurrenceType = formData.recurrenceType || 'diario';
                        this.selectedWeek = formData.selectedWeek || '';
                        this.selectedWeekday = formData.selectedWeekday || '';
                        this.selectedWeekdays = formData.selectedWeekdays || [];
                        this.monthday = formData.monthday || '';
                    }

                    // Servicios
                    this.selectedMainServices = formData.selectedMainServices || [];
                    this.selectedSubServices = formData.selectedSubServices || [];

                    // Campos adicionales
                    this.request_date = formData.request_date || '';
                    this.timestamp = formData.timestamp || '';

                    // Iniciar en el paso 2
                    this.step = 2;

                    // Inicializar selectedMonthDay con el primer día
                    this.selectedMonthDay = this.weekdays[0].value;

                    console.log('Estado después de cargar:', this);
                } catch (error) {
                    console.error('Error procesando datos:', error);
                }
            } else {
                // Inicialización por defecto
                this.activity_name = '';
                this.activity_location = '';
                this.start = '';
                this.end = '';
                this.observations = '';
                this.isRecurrent = false;
                this.activity_date = '';
                this.selectedMainServices = [];
                this.selectedSubServices = [];
            }

            // Configurar event listeners
            const startInput = document.getElementById('start');
            const endInput = document.getElementById('end');

            if (startInput) {
                startInput.addEventListener('change', (e) => {
                    this.startTime = e.target.value;
                });
            }

            if (endInput) {
                endInput.addEventListener('change', (e) => {
                    this.endTime = e.target.value;
                });
            }

            const productOptInputs = document.querySelectorAll('input[name="product_opt"]');
            productOptInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    this.isRecurrent = e.target.value === 'recurrente';
                });
            });

            const authInputs = document.querySelectorAll('input[name="authorization"]');
            authInputs.forEach(input => {
                input.addEventListener('change', () => {
                    document.querySelector('.authorization-section').classList.remove('error-highlight');
                    this.formErrors = this.formErrors.filter(error => error !== 'Autorización web');
                });
            });

            const recurrenceSelect = document.getElementById('recurrence');
            if (recurrenceSelect) {
                recurrenceSelect.addEventListener('change', (e) => {
                    this.recurrenceType = e.target.value;
                    this.selectedWeekdays = [];
                    this.selectedWeekday = '';
                    this.selectedMonthday = '';
                });
            }

            this.$nextTick(() => {
                var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
            });

            this.selectedWeekdays = [];
            this.selectedWeek = 'primera';
            this.selectedWeekday = 'lunes';
            this.activity_name = '';
            this.activity_location = '';
            this.start = '';
            this.end = '';
            this.activity_date = '';
            this.observations = '';

            // Iniciar el autoguardado
            this.startAutoSave();
            
            // Verificar datos guardados
            const savedData = localStorage.getItem('formData');
            if (savedData) {
                try {
                    console.log('Datos guardados encontrados');
                } catch (error) {
                    console.error('Error al leer datos guardados:', error);
                    this.clearSavedData();
                }
            }

            // Agregar evento para guardar antes de cerrar/actualizar
            window.addEventListener('beforeunload', () => {
                if (this.hasFormChanges()) {
                    this.saveFormData();
                }
            });

            // Agregar evento para confirmar antes de cerrar/actualizar
            window.addEventListener('beforeunload', (e) => {
                if (this.hasUnsavedChanges) {
                    e.preventDefault();
                    e.returnValue = ''; // Mensaje estándar del navegador
                }
            });

            // Verificar cambios en campos importantes
            this.$watch('step', () => this.markUnsavedChanges());
            this.$watch('isRecurrent', () => this.markUnsavedChanges());
            this.$watch('selectedMainServices', () => this.markUnsavedChanges(), { deep: true });
            this.$watch('selectedSubServices', () => this.markUnsavedChanges(), { deep: true });
            this.$watch('activity_name', () => this.markUnsavedChanges());
            this.$watch('activity_location', () => this.markUnsavedChanges());
        },

        getSubServices(mainService) {
            return this.subServiceOptions[mainService] || [];
        },

        applyTemplate(template) {
            console.log('Aplicando plantilla:', template);
            this.selectedTemplate = template;
            if (this.templateServices[template]) {
                this.selectedMainServices = [...this.templateServices[template].mainServices];
                this.selectedSubServices = [...this.templateServices[template].subServices];
            }
        },
        
        validateStep1() {
            console.log('Validando Step 1 - Estado actual:', {
                isRecurrent: this.isRecurrent,
                product_opt: this.product_opt
            });
            return true;
        },

        validateStep2() {
            console.log('Validando Step 2 - Estado actual:', {
                isRecurrent: this.isRecurrent,
                product_opt: this.product_opt,
                selectedMainServices: this.selectedMainServices,
                selectedAuthorization: this.selectedAuthorization
            });
            
            if (this.selectedMainServices.length === 0) {
                alert('Por favor seleccione al menos un servicio principal');
                return false;
            }
            if (!this.selectedAuthorization) {
                alert('Por favor seleccione una opción de autorización');
                return false;
            }
            return true;
        },

        validateTime(event) {
            const input = event.target;
            const value = input.value;
            
            if (input.id === 'start') {
                this.startTime = value;
            } else if (input.id === 'end') {
                this.endTime = value;
            }
            
            if (value) {
                const [hours, minutes] = value.split(':');
                if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                    alert('Por favor ingrese una hora válida');
                    input.value = '';
                    input.focus();
                    return false;
                }
            }
            return true;
        },

        validateStep3() {
            if (!this.activity_name || !this.activity_location) {
                this.showError('Por favor complete los campos obligatorios');
                return false;
            }

            if (this.isRecurrent) {
                if (!this.start_date || !this.end_date || !this.start || !this.end) {
                    this.showError('Por favor complete las fechas y horarios');
                    return false;
                }

                if (!this.recurrenceType) {
                    this.showError('Por favor seleccione un tipo de recurrencia');
                    return false;
                }

                // Validación específica para recurrencia mensual
                if (this.recurrenceType === 'mensual') {
                    if (!this.monthWeek || !this.selectedMonthDay) {
                        this.showError('Por favor seleccione la semana y el día del mes');
                        return false;
                    }
                }

                // Validación existente para recurrencia semanal
                if (this.recurrenceType === 'semanal' && this.selectedWeekdays.length === 0) {
                    this.showError('Por favor seleccione al menos un día de la semana');
                    return false;
                }
            } else {
                if (!this.activity_date || !this.start || !this.end) {
                    this.showError('Por favor complete la fecha y horarios');
                    return false;
                }
            }

            return true;
        },

        validateStep4() {
            if (!this.selectedAuthorization) {
                alert('Por favor seleccione una opción de autorización');
                return false;
            }

            const requiredFields = ['department', 'applicant', 'email', 'contact'];
            for (let field of requiredFields) {
                const element = document.getElementById(field);
                if (!element || !element.value.trim()) {
                    alert(`Por favor complete el campo ${field.replace('_', ' ')}`);
                    return false;
                }
            }
            return true;
        },

        setActivityType(type) {
            this.product_opt = type;
            this.isRecurrent = type === 'recurrente';
        },

        async submitForm() {
            try {
                console.log('Enviando formulario con días:', this.selectedWeekdays);

                const formData = {
                    selectedMainServices: this.selectedMainServices,
                    selectedSubServices: this.selectedSubServices,
                    product_opt: this.product_opt,
                    authorization: this.selectedAuthorization,
                    activity_name: this.activity_name,
                    activity_location: this.activity_location,
                    activity_date: this.activity_date,
                    start: this.start,
                    end: this.end,
                    start_date: this.start_date,
                    end_date: this.end_date,
                    recurrenceType: this.recurrenceType,
                    selectedWeekdays: this.selectedWeekdays,
                    observations: this.observations,
                    request_date: this.request_date,
                    department: this.department,
                    applicant: this.applicant,
                    email: this.email,
                    contact: this.contact,
                    isRecurrent: this.isRecurrent,
                    monthWeek: this.monthWeek,
                    selectedMonthDay: this.selectedMonthDay
                };

                console.log('Datos a enviar:', formData);

                const response = await fetch('/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('[name=csrf-token]')?.content
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (result.success) {
                    this.hasUnsavedChanges = false;
                    this.clearSavedData();
                    window.location.href = result.view_url;
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                alert('Error al enviar el formulario: ' + error.message);
            }
        },

        nextStep() {
            if (this.step < this.totalSteps) {
                this.step++;
            }
        },

        prevStep() {
            if (this.step > 1) {
                this.step--;
            }
        },

        cleanSubServices() {
            this.selectedMainServices = [];
            this.selectedSubServices = [];
            this.selectedTemplate = "predeterminado";
            this.selectedAuthorization = null;
            this.showWarning = false;
        },

        validateDates() {
            const startDate = document.getElementById('start_date')?.value;
            const endDate = document.getElementById('end_date')?.value;
            
            if (startDate && endDate && startDate > endDate) {
                alert('La fecha de inicio no puede ser posterior a la fecha de fin');
                return false;
            }
            return true;
        },

        isRecurrenceType(type) {
            return this.recurrenceType === type;
        },

        showError(message) {
            alert(message);
        },

        validateAllSteps() {
            return this.validateStep1() && this.validateStep2() && this.validateStep3() && this.validateStep4();
        },

        getRecurrencePattern() {
            if (!this.isRecurrent) return '';

            switch (this.recurrenceType) {
                case 'mensual':
                    return `${this.monthWeek} ${this.selectedMonthDay} de cada mes`;
                case 'semanal':
                    return `Cada ${this.selectedWeekdays.join(', ')}`;
                case 'diario':
                    return 'Todos los días';
                default:
                    return '';
            }
        },

        // Método para calcular el total de sesiones
        calculateTotalSessions() {
            if (!this.isRecurrent || !this.start_date || !this.end_date) {
                return 0;
            }

            const start = new Date(this.start_date);
            const end = new Date(this.end_date);
            let total = 0;

            switch (this.recurrenceType) {
                case 'diario':
                    // Calcular días hábiles (lunes a viernes)
                    let current = new Date(start);
                    while (current <= end) {
                        if (current.getDay() !== 0 && current.getDay() !== 6) { // 0 = domingo, 6 = sábado
                            total++;
                        }
                        current.setDate(current.getDate() + 1);
                    }
                    break;

                case 'semanal':
                    // Calcular semanas y multiplicar por días seleccionados
                    const weeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
                    total = weeks * this.selectedWeekdays.length;
                    break;

                case 'mensual':
                    // Calcular meses entre las fechas
                    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                                 (end.getMonth() - start.getMonth()) + 1;
                    total = months; // Una sesión por mes
                    break;
            }

            return total;
        },

        // Método para obtener los servicios seleccionados formateados
        getSelectedServices() {
            let services = [];
            
            // Agregar servicios principales
            if (Array.isArray(this.selectedMainServices)) {
                services = services.concat(this.selectedMainServices);
            }
            
            // Agregar subservicios
            if (Array.isArray(this.selectedSubServices)) {
                services = services.concat(this.selectedSubServices);
            }
            
            return services;
        },

        // Método para manejar la selección de servicios principales
        toggleMainService(service) {
            console.log('Toggle main service:', service);
            const index = this.selectedMainServices.indexOf(service);
            
            if (index === -1) {
                // Agregar el servicio principal
                this.selectedMainServices.push(service);
                // Ya no preseleccionamos automáticamente los subservicios
            } else {
                // Remover el servicio principal
                this.selectedMainServices.splice(index, 1);
                // Remover los subservicios asociados
                this.selectedSubServices = this.selectedSubServices.filter(
                    subService => !this.subServiceOptions[service]?.includes(subService)
                );
            }
            
            console.log('Servicios actualizados:', {
                main: this.selectedMainServices,
                sub: this.selectedSubServices
            });
        },

        // Método para manejar la selección de subservicios
        toggleSubService(subService, mainService) {
            const index = this.selectedSubServices.indexOf(subService);
            if (index === -1) {
                this.selectedSubServices.push(subService);
                // Si no está seleccionado el servicio principal correspondiente, lo seleccionamos
                if (!this.selectedMainServices.includes(mainService)) {
                    this.selectedMainServices.push(mainService);
                }
            } else {
                this.selectedSubServices.splice(index, 1);
                // Si no quedan subservicios seleccionados para este servicio principal, lo deseleccionamos
                const hasOtherSubServices = this.selectedSubServices.some(
                    s => this.subServiceOptions[mainService]?.includes(s)
                );
                if (!hasOtherSubServices) {
                    const mainIndex = this.selectedMainServices.indexOf(mainService);
                    if (mainIndex !== -1) {
                        this.selectedMainServices.splice(mainIndex, 1);
                    }
                }
            }
            console.log('Servicios actualizados:', {
                main: this.selectedMainServices,
                sub: this.selectedSubServices
            });
        },

        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        },

        toggleWeekday(day) {
            day.checked = !day.checked;
            this.selectedWeekdays = this.weekdays
                .filter(d => d.checked)
                .map(d => d.name);
        },

        hasFormChanges() {
            // Verificar si hay cambios en el formulario
            return this.applicant || 
                   this.email || 
                   this.activity_name || 
                   this.start_date ||
                   this.selectedMainServices.length > 0;
        },

        markUnsavedChanges() {
            this.hasUnsavedChanges = true;
            this.saveFormData(); // Guardar automáticamente al detectar cambios
        },

        saveFormData() {
            if (!this.hasFormChanges()) return;

            this.isSaving = true;
            console.log('Guardando datos del formulario...');
            
            try {
                localStorage.setItem('formData', JSON.stringify(this.getFormData()));
                console.log('Datos guardados exitosamente');
                this.hasUnsavedChanges = false;
                
                setTimeout(() => {
                    this.isSaving = false;
                }, 2000);
            } catch (error) {
                console.error('Error al guardar datos:', error);
                this.isSaving = false;
            }
        },

        getFormData() {
            return {
                step: this.step,
                isRecurrent: this.isRecurrent,
                recurrenceType: this.recurrenceType,
                monthWeek: this.monthWeek,
                selectedMonthDay: this.selectedMonthDay,
                selectedWeekdays: this.selectedWeekdays,
                weekdays: this.weekdays.map(day => ({
                    ...day,
                    checked: day.checked
                })),
                start_date: this.start_date,
                end_date: this.end_date,
                start: this.start,
                end: this.end,
                applicant: this.applicant,
                email: this.email,
                contact: this.contact,
                department: this.department,
                activity_name: this.activity_name,
                activity_location: this.activity_location,
                selectedMainServices: this.selectedMainServices,
                selectedSubServices: this.selectedSubServices,
                observations: this.observations,
                activity_details: this.activity_details,
                product_opt: this.product_opt
            };
        },

        startAutoSave() {
            // Guardar cada 30 segundos si hay cambios
            setInterval(() => {
                this.saveFormData();
            }, 30000);

            // También guardar cuando el usuario hace cambios importantes
            this.$watch('step', () => this.saveFormData());
            this.$watch('isRecurrent', () => this.saveFormData());
            this.$watch('selectedMainServices', () => this.saveFormData(), { deep: true });
            this.$watch('selectedSubServices', () => this.saveFormData(), { deep: true });
        },

        clearSavedData() {
            console.log('Limpiando datos guardados...');
            localStorage.removeItem('formData');
            window.location.reload();
        },

        restoreFormData(data) {
            if (!data) return;
            
            console.log('Restaurando datos del formulario...');
            try {
                Object.keys(data).forEach(key => {
                    if (this.hasOwnProperty(key)) {
                        this[key] = data[key];
                    }
                });

                // Restaurar estado de los días de la semana
                if (data.weekdays) {
                    this.weekdays = data.weekdays;
                }

                console.log('Datos restaurados exitosamente');
                localStorage.removeItem('formData');
            } catch (error) {
                console.error('Error al restaurar datos:', error);
                this.clearSavedData();
            }
        }
    }));
});
