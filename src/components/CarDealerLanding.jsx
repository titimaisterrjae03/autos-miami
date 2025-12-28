
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, Phone, Calendar, MapPin, X, CheckCircle, Star, BadgeCheck, Car, Gauge, DollarSign, LogIn } from 'lucide-react';
// Admin panel is now on a separate route /carAdmin

const CarDealerLanding = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Dynamic Data States
    const [siteConfig, setSiteConfig] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Parallel Fetching
            const [carsRes, configRes, testimsRes, faqsRes] = await Promise.all([
                supabase.from('cars').select('*').order('created_at', { ascending: false }),
                supabase.from('site_config').select('*').single(),
                supabase.from('testimonials').select('*').eq('is_visible', true).order('created_at', { ascending: false }),
                supabase.from('faqs').select('*').eq('is_visible', true).order('created_at', { ascending: false })
            ]);

            if (carsRes.data) setCars(carsRes.data);
            if (configRes.data) setSiteConfig(configRes.data);
            if (testimsRes.data) setTestimonials(testimsRes.data);
            if (faqsRes.data) setFaqs(faqsRes.data);

            setLoading(false);
        };

        fetchData();
    }, []);

    const filteredCars = cars.filter(car =>
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCarClick = (car) => {
        if (car.status === 'available') {
            setSelectedCar(car);
            setCurrentImageIndex(0); // Reset carousel
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (selectedCar && selectedCar.images) {
            setCurrentImageIndex((prev) => (prev + 1) % selectedCar.images.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (selectedCar && selectedCar.images) {
            setCurrentImageIndex((prev) => (prev - 1 + selectedCar.images.length) % selectedCar.images.length);
        }
    };

    const handleWhatsAppClick = (car) => {
        const message = car
            ? `Hola, vi el ${car.make} ${car.model} ${car.year} en la web y me interesa.`
            : 'Hola, quiero agendar una cita para ver autos.';
        const url = `https://wa.me/584126796865?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };



    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Car className="text-blue-900 w-8 h-8" />
                        <h1 className="text-2xl font-bold tracking-tight text-blue-900">MIAMI<span className="text-blue-600">AUTO</span></h1>
                    </div>

                    <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
                        <button onClick={() => document.getElementById('inventory').scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-900 transition-colors">Inventario</button>
                        <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-900 transition-colors">Nosotros</button>
                        <button onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-900 transition-colors">Comentarios</button>
                        <button onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-900 transition-colors">Preguntas</button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => handleWhatsAppClick(null)}
                            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            <Phone className="w-5 h-5" />
                            <span className="hidden sm:inline">Agendar Cita</span>
                            <span className="sm:hidden">Cita</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative bg-blue-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent z-10 opacity-90"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920')" }}
                ></div>

                <div className="container mx-auto px-4 py-20 relative z-20">
                    <div className="max-w-2xl">
                        <div className="flex items-center space-x-2 bg-blue-800/50 w-fit px-3 py-1 rounded-full text-sm font-medium mb-4 border border-blue-400/30">
                            <BadgeCheck className="w-4 h-4 text-blue-300" />
                            <span>Aprobación Garantizada</span>
                        </div>
                        {/* Dynamic Hero Title */}
                        {(!siteConfig || siteConfig.show_hero_title) && (
                            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight whitespace-pre-line">
                                {siteConfig?.hero_title || (
                                    <>Tu Auto en Miami Hoy. <br /><span className="text-blue-300">Solo con Pasaporte.</span></>
                                )}
                            </h2>
                        )}

                        {/* Dynamic Hero Slogan */}
                        {(!siteConfig || siteConfig.show_hero_slogan) && (
                            <p className="text-xl text-blue-100 mb-8 font-light whitespace-pre-line">
                                {siteConfig?.hero_slogan || "Sin crédito, sin social security. Sal manejando el mismo día con las iniciales más bajas del mercado. Trato rápido y transparente."}
                            </p>
                        )}
                        <button
                            onClick={() => document.getElementById('inventory').scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-100 transition-colors"
                        >
                            Ver Inventario Disponible
                        </button>
                    </div>
                </div>
            </section>

            {/* SEARCH & FILTER */}
            <section id="inventory" className="py-10 container mx-auto px-4">
                <div className="max-w-2xl mx-auto -mt-16 relative z-30 mb-12">
                    <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-4 border border-gray-100">
                        <Search className="text-gray-400 w-6 h-6 ml-2" />
                        <input
                            type="text"
                            placeholder="Busca por marca o modelo (ej. Toyota, Civic)..."
                            className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">Inventario Reciente</h3>
                        <p className="text-gray-500 mt-1">
                            {loading ? 'Cargando autos...' : `${filteredCars.length} autos disponibles para entrega inmediata`}
                        </p>
                    </div>
                </div>

                {/* INVENTORY GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow h-96 animate-pulse">
                                <div className="h-56 bg-gray-200 rounded-t-2xl"></div>
                                <div className="p-5 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCars.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCars.map(car => (
                            <div
                                key={car.id}
                                className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group ${car.status === 'sold' ? 'opacity-75 pointer-events-none' : 'cursor-pointer'}`}
                                onClick={() => handleCarClick(car)}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={car.image}
                                        alt={`${car.make} ${car.model}`}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                    />
                                    {car.status === 'sold' && (
                                        <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center backdrop-blur-sm">
                                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xl tracking-wider uppercase transform -rotate-12 shadow-lg border-2 border-white">
                                                Vendido
                                            </span>
                                        </div>
                                    )}
                                    {car.status === 'available' && (
                                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                                            DISPONIBLE
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900">{car.make} {car.model}</h4>
                                            <p className="text-sm text-gray-500 font-medium">{car.year}</p>
                                        </div>
                                        {car.price ? (
                                            <div className="bg-blue-50 px-3 py-1 rounded-lg">
                                                <p className="text-blue-900 font-bold">${Number(car.price).toLocaleString()}</p>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <Gauge className="w-4 h-4 text-blue-500" />
                                            <span>{Number(car.miles).toLocaleString()} mi</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-semibold text-green-600">
                                            <DollarSign className="w-4 h-4" />
                                            <span>Inicial: ${Number(car.down_payment || 1500).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhatsAppClick(car);
                                        }}
                                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Consultar más info
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-500">No encontramos autos con esa búsqueda.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-blue-600 font-semibold hover:underline"
                        >
                            Ver todos los autos
                        </button>
                    </div>
                )}
            </section>

            {/* ABOUT US */}
            <section id="about" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=1000"
                                alt="Equipo Miami Auto"
                                className="rounded-3xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm">
                                Nuestra Historia
                            </div>
                            {/* Dynamic About Content */}
                            <h2 className="text-4xl font-bold text-gray-900 leading-tight whitespace-pre-line">
                                {siteConfig?.about_title || (
                                    <>Ayudando a Familias Latinas a <span className="text-blue-600">Avanzar</span></>
                                )}
                            </h2>
                            <div className="space-y-4 text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                {siteConfig?.about_description || (
                                    <>
                                        <p>En <strong>Miami Auto</strong>, entendemos que llegar a un nuevo país es un desafío. Por eso, nos hemos dedicado a eliminar las barreras tradicionales para obtener un vehículo.</p>
                                        <p>No somos solo un concesionario; somos tu aliado. Sabemos que tu auto es más que un transporte: es tu herramienta de trabajo, el medio para llevar a tus hijos a la escuela y la llave de tu libertad en Estados Unidos.</p>
                                        <p>Nos especializamos en aprobar créditos basados en tu potencial futuro, no solo en tu pasado. Con solo tu pasaporte y una pequeña inicial, te entregamos las llaves de tu nuevo comienzo.</p>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-6 pt-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-900">500+</p>
                                    <p className="text-sm text-gray-500">Autos Entregados</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-900">98%</p>
                                    <p className="text-sm text-gray-500">Aprobación</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-900">24h</p>
                                    <p className="text-sm text-gray-500">Entrega Rápida</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="testimonials" className="bg-white py-20 mt-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Clientes Felices</h2>
                        <p className="text-gray-500">Familias latinas que ya tienen su auto en Miami</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1 mb-3 text-yellow-400">
                                    {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-gray-700 italic mb-4">"{t.text}"</p>
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                    <span>{t.country}</span>
                                    <span>{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
                        <p className="text-gray-600">Resolvemos tus dudas para que compres con confianza</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    {faq.question || faq.q}
                                </h3>
                                <p className="text-gray-600 pl-7">{faq.answer || faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-blue-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-6">
                                <Car className="text-blue-400 w-8 h-8" />
                                <h2 className="text-2xl font-bold tracking-tight">MIAMI<span className="text-blue-400">AUTO</span></h2>
                            </div>
                            <p className="text-blue-200 max-w-md mb-6 leading-relaxed">
                                Tu concesionario de confianza en Miami. Especialistas en ayudar a la comunidad latina a conseguir el auto de sus sueños, sin complicaciones y con total transparencia.
                            </p>
                            <div className="flex gap-4">
                                {[
                                    { icon: <Phone className="w-5 h-5" />, text: "+58 412 679 6865" },
                                    { icon: <MapPin className="w-5 h-5" />, text: "Miami, FL" }
                                ].map((contact, i) => (
                                    <div key={i} className="flex items-center gap-2 text-blue-200 bg-blue-800/50 px-4 py-2 rounded-lg">
                                        {contact.icon}
                                        <span className="text-sm font-medium">{contact.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-6 text-blue-100">Enlaces Rápidos</h3>
                            <ul className="space-y-4 text-blue-300">
                                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Inicio</button></li>
                                <li><button onClick={() => document.getElementById('inventory').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Inventario</button></li>
                                <li><button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Nosotros</button></li>
                                <li><button onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Preguntas</button></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-6 text-blue-100">Horario</h3>
                            <ul className="space-y-4 text-blue-300">
                                <li className="flex justify-between"><span>Lunes - Viernes</span> <span>9am - 7pm</span></li>
                                <li className="flex justify-between"><span>Sábado</span> <span>10am - 6pm</span></li>
                                <li className="flex justify-between"><span>Domingo</span> <span>Cita Previa</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center text-blue-400 text-sm">
                        <p>&copy; {new Date().getFullYear()} Miami Auto. Todos los derechos reservados.</p>
                        <div className="flex items-center gap-6 mt-4 md:mt-0">
                            <a href="/carAdmin" className="hover:text-white transition-colors">Admin Login</a>
                            <span>Privacidad</span>
                            <span>Términos</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MODAL */}
            {selectedCar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
                        onClick={() => setSelectedCar(null)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10 animate-fade-in-up flex flex-col md:flex-row">
                        <button
                            onClick={() => setSelectedCar(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-full md:w-1/2 relative bg-gray-100 aspect-[4/3] md:aspect-auto">
                            {/* CAROUSEL */}
                            <img
                                src={(selectedCar.images && selectedCar.images.length > 0) ? selectedCar.images[currentImageIndex] : selectedCar.image}
                                alt={selectedCar.model}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                            />

                            {selectedCar.images && selectedCar.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                                    >
                                        →
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                        {selectedCar.images.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-8 w-full md:w-1/2 overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedCar.make} {selectedCar.model}</h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">{selectedCar.year}</span>
                                    <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">{Number(selectedCar.miles).toLocaleString()} mi</span>
                                </div>

                                {selectedCar.description ? (
                                    <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                                        {selectedCar.description}
                                    </p>
                                ) : (
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        Excelente oportunidad para llevarte este <strong>{selectedCar.make} {selectedCar.model} {selectedCar.year}</strong>.
                                        Un vehículo confiable e inspeccionado, listo para entrega inmediata.
                                        No te preocupes por tu crédito, con tu pasaporte y una inicial de <strong>${Number(selectedCar.down_payment || 1500).toLocaleString()}</strong> sales manejando hoy mismo.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                {selectedCar.price && (
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                        <span className="text-gray-500 font-medium">Precio Total</span>
                                        <span className="text-2xl font-bold text-gray-900">${Number(selectedCar.price).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                                    <span className="text-green-700 font-bold">Inicial Requerida</span>
                                    <span className="text-2xl font-bold text-green-700">${Number(selectedCar.down_payment || 1500).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleWhatsAppClick(selectedCar)}
                                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    Me interesa este Auto
                                </button>
                                <p className="text-xs text-center text-gray-400">
                                    Al hacer clic, abrirás un chat de WhatsApp con un asesor.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER LINK FOR ADMIN (MOBILE) */}
            <div className="fixed bottom-4 left-4 md:hidden z-50">

            </div>
        </div>
    );
};

export default CarDealerLanding;
