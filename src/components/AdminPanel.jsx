
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, Edit, Save, Upload, LogOut, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('cars'); // cars, general, testimonials, faq
    const [error, setError] = useState(null);

    // DATA STATES
    const [cars, setCars] = useState([]);
    const [siteConfig, setSiteConfig] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [faqs, setFaqs] = useState([]);

    // EDITING STATES
    const [editingCar, setEditingCar] = useState(null);
    const [carForm, setCarForm] = useState({
        make: '', model: '', year: new Date().getFullYear(),
        price: '', miles: '', down_payment: 1500,
        status: 'available', image: '', images: [], description: ''
    });

    const [testimonialForm, setTestimonialForm] = useState({ name: '', country: '🌎', text: '', stars: 5 });
    const [editingTestimonial, setEditingTestimonial] = useState(null);

    const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
    const [editingFaq, setEditingFaq] = useState(null);


    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchAllData();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchAllData();
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchAllData = async () => {
        fetchCars();
        fetchSiteConfig();
        fetchTestimonials();
        fetchFaqs();
    };

    const fetchCars = async () => {
        const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
        setCars(data || []);
    };
    const fetchSiteConfig = async () => {
        const { data } = await supabase.from('site_config').select('*').single();
        if (data) setSiteConfig(data);
    };
    const fetchTestimonials = async () => {
        const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        setTestimonials(data || []);
    };
    const fetchFaqs = async () => {
        const { data } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
        setFaqs(data || []);
    };

    // --- AUTH ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    // --- CARS HANDLERS ---
    const handleCarSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = {
            ...carForm,
            year: parseInt(carForm.year),
            price: carForm.price ? parseFloat(carForm.price) : null,
            miles: parseFloat(carForm.miles),
            down_payment: parseFloat(carForm.down_payment),
        };

        if (editingCar) {
            await supabase.from('cars').update(dataToSave).eq('id', editingCar.id);
        } else {
            await supabase.from('cars').insert([dataToSave]);
        }
        setLoading(false);
        setEditingCar(null);
        setCarForm({ make: '', model: '', year: new Date().getFullYear(), price: '', miles: '', down_payment: 1500, status: 'available', image: '', images: [], description: '' });
        fetchCars();
    };
    const deleteCar = async (id) => {
        if (!confirm('¿Eliminar auto?')) return;
        await supabase.from('cars').delete().eq('id', id);
        fetchCars();
    };
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setLoading(true);
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
                const { error } = await supabase.storage.from('car-images').upload(fileName, file);
                if (error) throw error;
                const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
                uploadedUrls.push(data.publicUrl);
            }
            setCarForm(prev => ({
                ...prev,
                images: [...(prev.images || []), ...uploadedUrls],
                image: (!prev.image && uploadedUrls.length) ? uploadedUrls[0] : prev.image
            }));
        } catch (err) { alert(err.message); }
        setLoading(false);
    };

    // --- GENERAL CONTENT HANDLERS ---
    const updateSiteConfig = async (e) => {
        e.preventDefault();
        setLoading(true);
        await supabase.from('site_config').update(siteConfig).eq('id', 1);
        setLoading(false);
        alert('Configuración guardada');
    };

    // --- TESTIMONIALS HANDLERS ---
    const handleTestimonialSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (editingTestimonial) {
            await supabase.from('testimonials').update(testimonialForm).eq('id', editingTestimonial.id);
        } else {
            await supabase.from('testimonials').insert([testimonialForm]);
        }
        setLoading(false);
        setEditingTestimonial(null);
        setTestimonialForm({ name: '', country: '🌎', text: '', stars: 5 });
        fetchTestimonials();
    };
    const deleteTestimonial = async (id) => {
        if (!confirm('¿Eliminar testimonio?')) return;
        await supabase.from('testimonials').delete().eq('id', id);
        fetchTestimonials();
    };
    const toggleTestimonialVisibility = async (t) => {
        await supabase.from('testimonials').update({ is_visible: !t.is_visible }).eq('id', t.id);
        fetchTestimonials();
    };

    // --- FAQ HANDLERS ---
    const handleFaqSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (editingFaq) {
            await supabase.from('faqs').update(faqForm).eq('id', editingFaq.id);
        } else {
            await supabase.from('faqs').insert([faqForm]);
        }
        setLoading(false);
        setEditingFaq(null);
        setFaqForm({ question: '', answer: '' });
        fetchFaqs();
    };
    const deleteFaq = async (id) => {
        if (!confirm('¿Eliminar pregunta?')) return;
        await supabase.from('faqs').delete().eq('id', id);
        fetchFaqs();
    };
    const toggleFaqVisibility = async (f) => {
        await supabase.from('faqs').update({ is_visible: !f.is_visible }).eq('id', f.id);
        fetchFaqs();
    };


    if (!session) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-3 rounded" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-3 rounded" />
                    <button disabled={loading} className="w-full bg-blue-900 text-white p-3 rounded font-bold">{loading ? '...' : 'Entrar'}</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-900">Panel de Control</h1>
                        <div className="flex gap-2">
                            <button onClick={() => navigate('/')} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">Ver Web</button>
                            <button onClick={handleLogout} className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm">Salir</button>
                        </div>
                    </div>
                    <div className="flex space-x-6 overflow-x-auto">
                        {[
                            { id: 'cars', label: 'Inventario' },
                            { id: 'general', label: 'Contenido General' },
                            { id: 'testimonials', label: 'Testimonios' },
                            { id: 'faq', label: 'Preguntas Frecuentes' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {/* --- CARS TAB --- */}
                {activeTab === 'cars' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                                <h2 className="font-bold text-lg mb-4">{editingCar ? 'Editar Auto' : 'Nuevo Auto'}</h2>
                                <form onSubmit={handleCarSubmit} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input placeholder="Marca" className="border p-2 rounded" value={carForm.make} onChange={e => setCarForm({ ...carForm, make: e.target.value })} required />
                                        <input placeholder="Modelo" className="border p-2 rounded" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Año" className="border p-2 rounded" value={carForm.year} onChange={e => setCarForm({ ...carForm, year: e.target.value })} required />
                                        <input type="number" placeholder="Millas" className="border p-2 rounded" value={carForm.miles} onChange={e => setCarForm({ ...carForm, miles: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Precio (Opcional)" className="border p-2 rounded" value={carForm.price || ''} onChange={e => setCarForm({ ...carForm, price: e.target.value })} />
                                        <input type="number" placeholder="Inicial" className="border p-2 rounded" value={carForm.down_payment} onChange={e => setCarForm({ ...carForm, down_payment: e.target.value })} />
                                    </div>
                                    <textarea placeholder="Descripción personalizada..." className="border p-2 rounded w-full h-20" value={carForm.description || ''} onChange={e => setCarForm({ ...carForm, description: e.target.value })} />
                                    <select className="border p-2 rounded w-full" value={carForm.status} onChange={e => setCarForm({ ...carForm, status: e.target.value })}>
                                        <option value="available">Disponible</option>
                                        <option value="sold">Vendido</option>
                                        <option value="reserved">Reservado</option>
                                        <option value="hidden">Oculto</option>
                                    </select>

                                    {/* Images */}
                                    <div className="border-2 border-dashed p-4 rounded text-center">
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="car-images" />
                                        <label htmlFor="car-images" className="cursor-pointer text-blue-600 text-sm">Subir Fotos (Carrusel)</label>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {carForm.images?.map((url, i) => (
                                            <div key={i} className={`relative aspect-square border cursor-pointer ${carForm.image === url ? 'ring-2 ring-green-500' : ''}`} onClick={() => setCarForm({ ...carForm, image: url })}>
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setCarForm(prev => ({ ...prev, images: prev.images.filter(x => x !== url) })) }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl">x</button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        {editingCar && <button type="button" onClick={() => { setEditingCar(null); setCarForm({ make: '', model: '', year: new Date().getFullYear(), price: '', miles: '', down_payment: 1500, status: 'available', image: '', images: [], description: '' }); }} className="flex-1 bg-gray-200 py-2 rounded">Cancelar</button>}
                                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingCar ? 'Guardar' : 'Crear'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            {cars.map(car => (
                                <div key={car.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <img src={car.image} className="w-16 h-16 rounded object-cover bg-gray-100" />
                                        <div>
                                            <h3 className="font-bold">{car.make} {car.model}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded ${car.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{car.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingCar(car); setCarForm(car); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-blue-600 bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteCar(car.id)} className="p-2 text-red-600 bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- GENERAL CONTENT TAB --- */}
                {activeTab === 'general' && siteConfig && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Contenido General de la Web</h2>
                        <form onSubmit={updateSiteConfig} className="space-y-6">
                            <div className="space-y-4 border-b pb-6">
                                <h3 className="font-semibold text-gray-500">Sección Principal (Hero)</h3>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-medium">Título Principal</label>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={siteConfig.show_hero_title} onChange={e => setSiteConfig({ ...siteConfig, show_hero_title: e.target.checked })} />
                                            <span className="text-xs text-gray-500">Mostrar</span>
                                        </div>
                                    </div>
                                    <input className="w-full border p-2 rounded" value={siteConfig.hero_title || ''} onChange={e => setSiteConfig({ ...siteConfig, hero_title: e.target.value })} />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-medium">Eslogan / Subtítulo</label>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={siteConfig.show_hero_slogan} onChange={e => setSiteConfig({ ...siteConfig, show_hero_slogan: e.target.checked })} />
                                            <span className="text-xs text-gray-500">Mostrar</span>
                                        </div>
                                    </div>
                                    <textarea className="w-full border p-2 rounded h-20" value={siteConfig.hero_slogan || ''} onChange={e => setSiteConfig({ ...siteConfig, hero_slogan: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-500">Sección Nuestra Historia</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título de la Sección</label>
                                    <input className="w-full border p-2 rounded" value={siteConfig.about_title || ''} onChange={e => setSiteConfig({ ...siteConfig, about_title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descripción / Historia</label>
                                    <textarea className="w-full border p-2 rounded h-40" value={siteConfig.about_description || ''} onChange={e => setSiteConfig({ ...siteConfig, about_description: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                                Guardar Cambios Generales
                            </button>
                        </form>
                    </div>
                )}

                {/* --- TESTIMONIALS TAB --- */}
                {activeTab === 'testimonials' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                                <h2 className="font-bold mb-4">{editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}</h2>
                                <form onSubmit={handleTestimonialSubmit} className="space-y-3">
                                    <input placeholder="Nombre Cliente" className="w-full border p-2 rounded" value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} required />
                                    <div className="flex gap-2">
                                        <input placeholder="Bandera/Emoji" className="w-1/3 border p-2 rounded" value={testimonialForm.country} onChange={e => setTestimonialForm({ ...testimonialForm, country: e.target.value })} />
                                        <select className="w-2/3 border p-2 rounded" value={testimonialForm.stars} onChange={e => setTestimonialForm({ ...testimonialForm, stars: parseInt(e.target.value) })}>
                                            <option value="5">⭐⭐⭐⭐⭐ 5</option>
                                            <option value="4">⭐⭐⭐⭐ 4</option>
                                            <option value="3">⭐⭐⭐ 3</option>
                                        </select>
                                    </div>
                                    <textarea placeholder="Comentario..." className="w-full border p-2 rounded h-24" value={testimonialForm.text} onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })} required />
                                    <div className="flex gap-2">
                                        {editingTestimonial && <button type="button" onClick={() => { setEditingTestimonial(null); setTestimonialForm({ name: '', country: '🌎', text: '', stars: 5 }); }} className="flex-1 bg-gray-200 py-2 rounded">Cancelar</button>}
                                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Guardar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="md:col-span-2 grid gap-4">
                            {testimonials.map(t => (
                                <div key={t.id} className={`bg-white p-4 rounded-xl shadow-sm flex justify-between gap-4 transition-opacity ${t.is_visible ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 font-bold">
                                            <span>{t.country}</span>
                                            <span>{t.name}</span>
                                            <span className="text-yellow-400 text-xs ml-2">{'★'.repeat(t.stars)}</span>
                                            {!t.is_visible && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-500">Oculto</span>}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1 italic">"{t.text}"</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => toggleTestimonialVisibility(t)} className="p-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200" title={t.is_visible ? 'Ocultar' : 'Mostrar'}>
                                            {t.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => { setEditingTestimonial(t); setTestimonialForm(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1 text-blue-600 bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteTestimonial(t.id)} className="p-1 text-red-600 bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- FAQ TAB --- */}
                {activeTab === 'faq' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                                <h2 className="font-bold mb-4">{editingFaq ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
                                <form onSubmit={handleFaqSubmit} className="space-y-3">
                                    <textarea placeholder="¿Pregunta?" className="w-full border p-2 rounded h-20 font-bold" value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} required />
                                    <textarea placeholder="Respuesta..." className="w-full border p-2 rounded h-32" value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} required />
                                    <div className="flex gap-2">
                                        {editingFaq && <button type="button" onClick={() => { setEditingFaq(null); setFaqForm({ question: '', answer: '' }); }} className="flex-1 bg-gray-200 py-2 rounded">Cancelar</button>}
                                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Guardar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            {faqs.map(f => (
                                <div key={f.id} className={`bg-white p-6 rounded-xl shadow-sm transition-opacity ${f.is_visible ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                {f.question}
                                                {!f.is_visible && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-500 font-normal">Oculto</span>}
                                            </h3>
                                            <p className="text-gray-600">{f.answer}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => toggleFaqVisibility(f)} className="p-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200" title={f.is_visible ? 'Ocultar' : 'Mostrar'}>
                                                {f.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => { setEditingFaq(f); setFaqForm(f); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1 text-blue-600 bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => deleteFaq(f.id)} className="p-1 text-red-600 bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;
