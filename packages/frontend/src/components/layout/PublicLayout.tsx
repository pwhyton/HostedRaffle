import { Outlet, Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/endpoints.js';

export default function PublicLayout() {
  const { orgSlug } = useParams<{ orgSlug: string }>();

  const { data: org } = useQuery({
    queryKey: ['org', orgSlug],
    queryFn: () => publicApi.getOrg(orgSlug!),
    enabled: !!orgSlug,
  });

  const primaryColour = org?.primaryColour || '#4F46E5';
  const secondaryColour = org?.secondaryColour || '#10B981';

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="text-white shadow-lg"
        style={{ backgroundColor: primaryColour }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/${orgSlug}`} className="flex items-center gap-3">
            {org?.logoUrl && (
              <img src={org.logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            )}
            <h1 className="text-xl font-bold">{org?.name || 'Loading...'}</h1>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to={`/${orgSlug}`} className="hover:underline">Raffles</Link>
            <Link to={`/${orgSlug}/my-tickets`} className="hover:underline">My Tickets</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet context={{ org, primaryColour, secondaryColour }} />
      </main>

      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        Powered by Raffle Tickets
      </footer>
    </div>
  );
}
