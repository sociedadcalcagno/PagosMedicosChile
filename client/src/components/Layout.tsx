import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  ClipboardList,
  Calculator,
  BarChart3,
  Settings,
  Heart,
  Bot,
  LogOut,
  User,
  Stethoscope,
  CreditCard,
} from "lucide-react";
import AIChat from "@/components/AIChat";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth() as { user: UserType | undefined; isLoading: boolean; isAuthenticated: boolean };
  const [location] = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        href: "/perfil",
        label: "Mi Perfil",
        icon: User,
        section: "Configuración",
      },
    ];

    // Admin gets full access including payment system
    if (user?.profile === "admin") {
      return [
        {
          href: "/usuarios",
          label: "Usuarios",
          icon: Users,
          section: "Gestión de Maestros",
        },
        {
          href: "/medicos",
          label: "Médicos",
          icon: UserCheck,
          section: "Gestión de Maestros",
        },
        {
          href: "/prestaciones",
          label: "Prestaciones",
          icon: ClipboardList,
          section: "Gestión de Maestros",
        },
        {
          href: "/reglas",
          label: "Reglas de Cálculo",
          icon: Calculator,
          section: "Gestión de Maestros",
        },
        {
          href: "/atenciones-medicas",
          label: "Atenciones Médicas",
          icon: Stethoscope,
          section: "Sistema de Pagos",
        },
        {
          href: "/calcular-pagos",
          label: "Calcular Pagos",
          icon: Calculator,
          section: "Sistema de Pagos",
        },
        {
          href: "/procesar-pagos",
          label: "Procesar Pagos",
          icon: CreditCard,
          section: "Sistema de Pagos",
        },
        {
          href: "/reportes",
          label: "Reporte Prestaciones",
          icon: BarChart3,
          section: "Reportes",
        },
        ...baseItems,
        {
          href: "/configuracion",
          label: "Configuración",
          icon: Settings,
          section: "Configuración",
        },
      ];
    }

    // Supervisor gets access to maintenance modules but not user management
    if (user?.profile === "supervisor") {
      return [
        {
          href: "/medicos",
          label: "Médicos",
          icon: UserCheck,
          section: "Gestión de Maestros",
        },
        {
          href: "/prestaciones",
          label: "Prestaciones",
          icon: ClipboardList,
          section: "Gestión de Maestros",
        },
        {
          href: "/reglas",
          label: "Reglas de Cálculo",
          icon: Calculator,
          section: "Gestión de Maestros",
        },
        {
          href: "/atenciones-medicas",
          label: "Atenciones Médicas",
          icon: Stethoscope,
          section: "Sistema de Pagos",
        },
        {
          href: "/calcular-pagos",
          label: "Calcular Pagos",
          icon: Calculator,
          section: "Sistema de Pagos",
        },
        {
          href: "/procesar-pagos",
          label: "Procesar Pagos",
          icon: CreditCard,
          section: "Sistema de Pagos",
        },
        {
          href: "/reportes",
          label: "Reporte Prestaciones",
          icon: BarChart3,
          section: "Reportes",
        },
        ...baseItems,
      ];
    }

    // Regular users/doctors get limited access
    return [
      {
        href: "/mis-pagos",
        label: "Mis Pagos",
        icon: Calculator,
        section: "Mi Actividad",
      },
      {
        href: "/participaciones",
        label: "Participaciones",
        icon: BarChart3,
        section: "Mi Actividad",
      },
      {
        href: "/reportes-medico",
        label: "Mis Reportes",
        icon: ClipboardList,
        section: "Mi Actividad",
      },
      ...baseItems,
    ];
  };

  const navigationItems = getNavigationItems();

  const getSectionItems = (section: string) =>
    navigationItems.filter((item) => item.section === section);

  const isActive = (href: string) => location === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-2 lg:px-6 lg:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Heart className="text-medical-blue text-xl lg:text-2xl" />
                <div className="hidden sm:block">
                  <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                    Portal de Pagos Médicos
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-500">Módulo Maestros</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-sm font-semibold text-gray-900">
                    Portal Médico
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* AI Agent Integration */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg px-2 py-1 lg:px-4 lg:py-2 text-white shadow-md">
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Bot className="text-xs lg:text-sm" />
                  <span className="text-xs lg:text-sm font-medium hidden sm:inline">
                    Agente HonorariosMedicos
                  </span>
                  <span className="text-xs font-medium sm:hidden">
                    AI
                  </span>
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-3 border-l border-gray-200 pl-2 lg:pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.profile || "Usuario"}
                  </p>
                </div>
                {user?.profileImageUrl && (
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={user.profileImageUrl}
                    alt="User Avatar"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/api/logout")}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 lg:pt-20 min-h-screen">
        {/* Sidebar */}
        <aside className="bg-white shadow-sm border-r border-gray-200 fixed left-0 top-16 lg:top-20 bottom-0 overflow-y-auto lg:block hidden z-40" style={{ width: '180px' }}>
          <nav className="p-3">
            <div className="space-y-2">
              {/* Gestión de Maestros */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Gestión de Maestros
                </h3>
                {getSectionItems("Gestión de Maestros").map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "bg-medical-blue text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Sistema de Pagos */}
              {getSectionItems("Sistema de Pagos").length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Sistema de Pagos
                  </h3>
                  {getSectionItems("Sistema de Pagos").map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            isActive(item.href)
                              ? "bg-medical-blue text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Reportes */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Reportes
                </h3>
                {getSectionItems("Reportes").map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "bg-medical-blue text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Configuración */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Configuración
                </h3>
                {getSectionItems("Configuración").map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "bg-medical-blue text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-20 left-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white shadow-md"
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside className={`lg:hidden fixed left-0 top-16 bottom-0 bg-white shadow-sm border-r border-gray-200 overflow-y-auto z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ width: '180px' }}>
          <nav className="p-4">
            <div className="space-y-2">
              {/* Same navigation content as desktop */}
              {/* Gestión de Maestros */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Gestión de Maestros
                </h3>
                {getSectionItems("Gestión de Maestros").map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "bg-medical-blue text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Sistema de Pagos - Mobile */}
              {getSectionItems("Sistema de Pagos").length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Sistema de Pagos
                  </h3>
                  {getSectionItems("Sistema de Pagos").map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            isActive(item.href)
                              ? "bg-medical-blue text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <Icon className="w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Reportes */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Reportes
                </h3>
                {getSectionItems("Reportes").map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "bg-medical-blue text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Configuración */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Configuración
                </h3>
                {getSectionItems("Configuración").map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "bg-medical-blue text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-0 main-content" style={{ marginLeft: '180px' }}>
          <div className="h-full px-4 py-4 lg:px-6 lg:py-6">{children}</div>
        </main>

        {/* AI Chat Component */}
        <AIChat />
      </div>
    </div>
  );
}
