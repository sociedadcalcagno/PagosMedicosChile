import Layout from "@/components/Layout";
import ConventionsSection from "@/components/ConventionsSection";
import { useQuery } from "@tanstack/react-query";

const isUnauthorizedError = (error: any) => error?.status === 401 || error?.message?.includes("Unauthorized");

export default function Conventions() {
  // Fetch data for conventions component
  const { data: specialties } = useQuery({
    queryKey: ["/api/specialties"],
    retry: (failureCount, error) => {
      return !isUnauthorizedError(error) && failureCount < 3;
    }
  });

  const { data: services } = useQuery({
    queryKey: ["/api/medical-services"],
    retry: (failureCount, error) => {
      return !isUnauthorizedError(error) && failureCount < 3;
    }
  });

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
    retry: (failureCount, error) => {
      return !isUnauthorizedError(error) && failureCount < 3;
    }
  });

  const { data: medicalSocieties } = useQuery({
    queryKey: ["/api/medical-societies"],
    retry: (failureCount, error) => {
      return !isUnauthorizedError(error) && failureCount < 3;
    }
  });

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6 w-full max-w-none">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Convenios Médicos</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Gestiona los convenios y acuerdos con instituciones de salud
            </p>
          </div>
        </div>

        {/* Conventions Content */}
        <ConventionsSection 
          specialties={Array.isArray(specialties) ? specialties : []}
          services={Array.isArray(services) ? services : []}
          doctors={Array.isArray(doctors) ? doctors : []}
          medicalSocieties={Array.isArray(medicalSocieties) ? medicalSocieties : []}
        />
      </div>
    </Layout>
  );
}