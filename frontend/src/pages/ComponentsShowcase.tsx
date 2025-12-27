import { Button } from "../components/atoms/Button"; // Ajusta la ruta si es necesario
import { Input } from "../components/atoms/Input";
import { LoginForm } from "../components/organisms/LoginForm";
import { MainTemplate } from "../components/templates/MainTemplate";
import { useEffect, useState } from "react";
import api from "../api/axios";

export const ComponentsShowcase = () => {
    const [usuarios, setUsuarios] = useState([]);

    const fetchUsuarios = async () => {
        try {
            const response = await api.get("/usuarios/");
            setUsuarios(response.data);
            console.log("petición exitosa:", response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    return (

        <MainTemplate>
            <div className="p-8">
                <h1 className="text-xl mb-4">Panel de Control (Protegido)</h1>
                <Button onClick={fetchUsuarios}>Consultar Usuarios</Button>

                {/* Lista de usuarios para validar que los datos llegaron */}
                <ul className="mt-4">
                    {usuarios.map((u: any) => (
                        <li key={u.id}>{u.username}</li>
                    ))}
                </ul>
            </div>

            <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-900">

                <div className="mx-auto max-w-4xl space-y-12">

                    {/* Encabezado */}
                    <div className="border-b border-slate-200 pb-5">
                        <h1 className="text-3xl font-bold tracking-tight">Design System: Button</h1>
                        <p className="mt-2 text-slate-500">
                            Todas las variantes y estados del componente atómico Button.
                        </p>
                    </div>

                    {/* SECCIÓN 1: VARIANTES (Colores/Estilos) */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">1. Variantes (Props: variant)</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

                            <div className="flex flex-col gap-2 border p-4 rounded bg-white">
                                <span className="text-xs text-slate-400 font-mono">default</span>
                                <Button>Primary</Button>
                            </div>


                            <div className="flex flex-col gap-2 border p-4 rounded bg-white">
                                <span className="text-xs text-slate-400 font-mono">secondary</span>
                                <Button variant="secondary">Secondary</Button>
                            </div>

                            <div className="flex flex-col gap-2 border p-4 rounded bg-white">
                                <span className="text-xs text-slate-400 font-mono">destructive</span>
                                <Button variant="destructive">Destructive</Button>
                            </div>

                            <div className="flex flex-col gap-2 border p-4 rounded bg-white">
                                <span className="text-xs text-slate-400 font-mono">outline</span>
                                <Button variant="outline">Outline</Button>
                            </div>

                            <div className="flex flex-col gap-2 border p-4 rounded bg-white">
                                <span className="text-xs text-slate-400 font-mono">ghost</span>
                                <Button variant="ghost">Ghost</Button>
                            </div>

                            <div className="flex flex-col gap-2 border p-4 rounded bg-white">
                                <span className="text-xs text-slate-400 font-mono">link</span>
                                <Button variant="link">Link Style</Button>
                            </div>

                        </div>
                    </section>

                    {/* SECCIÓN 2: TAMAÑOS */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">2. Tamaños (Props: size)</h2>
                        <div className="flex flex-wrap items-end gap-4 border p-6 rounded-lg bg-white">

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">sm</span>
                                <Button size="sm">Small</Button>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">default</span>
                                <Button size="default">Default</Button>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">lg</span>
                                <Button size="lg">Large Button</Button>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">icon</span>
                                <Button size="icon">
                                    {/* Simulamos un icono con texto, luego pondrás <Icon /> aquí */}
                                    +
                                </Button>
                            </div>

                        </div>
                    </section>

                    {/* SECCIÓN 3: ESTADOS Y POLIMORFISMO */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">3. Estados y Polimorfismo</h2>
                        <div className="grid gap-6 md:grid-cols-2">

                            {/* Disabled */}
                            <div className="border p-6 rounded-lg bg-white space-y-2">
                                <h3 className="font-medium text-sm text-slate-500">Estado Deshabilitado</h3>
                                <div className="flex gap-2">
                                    <Button disabled>No click</Button>
                                    <Button variant="secondary" disabled>No click</Button>
                                    <Button variant="ghost" disabled>No click</Button>
                                </div>
                            </div>

                            {/* asChild (Polimorfismo) */}
                            <div className="border p-6 rounded-lg bg-white space-y-2">
                                <h3 className="font-medium text-sm text-slate-500">
                                    Polimorfismo (asChild)
                                </h3>
                                <p className="text-xs text-slate-400 mb-2">
                                    Esto visualmente es un botón, pero en el HTML es un enlace &lt;a&gt;.
                                </p>
                                <Button asChild variant="default">
                                    <a href="https://google.com" target="_blank" rel="noreferrer">
                                        Ir a Google
                                    </a>
                                </Button>
                            </div>

                        </div>
                    </section>
                    {/* SECCIÓN 4: INPUTS */}
                    <section className="space-y-4 pt-10 border-t">
                        <h2 className="text-xl font-semibold">4. Inputs (Atom)</h2>
                        <div className="grid max-w-sm gap-4">

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email (Normal)</label>
                                <Input type="email" placeholder="correo@ejemplo.com" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Password (Type password)</label>
                                <Input type="password" placeholder="••••••••" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Deshabilitado</label>
                                <Input disabled placeholder="No puedes escribir aquí" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">File Input</label>
                                <Input type="file" />
                            </div>

                        </div>
                    </section>
                    {/* SECCIÓN 6: ORGANISMOS */}
                    <section className="space-y-6 pt-10 border-t pb-20">
                        <h2 className="text-xl font-semibold">6. Organism (LoginForm)</h2>
                        <p className="text-sm text-slate-500">
                            Componente completo con lógica de estado y validación básica.
                        </p>

                        <div className="flex justify-center bg-slate-100 p-10 rounded-xl">
                            {/* Aquí está tu obra maestra */}
                            <LoginForm />
                        </div>
                    </section>
                </div>
            </div>
        </MainTemplate>


    );
};