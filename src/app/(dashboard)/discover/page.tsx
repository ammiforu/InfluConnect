'use client';

import { useInfluencers } from '@/hooks/useInfluencers';
import { InfluencerCard } from '@/components/influencer/InfluencerCard';
import { InfluencerSearch } from '@/components/influencer/InfluencerSearch';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import type { InfluencerSearchParams } from '@/types';

export default function DiscoverPage() {
  const {
    influencers,
    total,
    isLoading,
    page,
    totalPages,
    params,
    updateParams,
    setPage,
  } = useInfluencers({ page: 1, limit: 12 });

  const handleSearch = (query: string) => {
    updateParams({ query });
  };

  const handleFilterChange = (filters: Partial<InfluencerSearchParams>) => {
    updateParams(filters);
  };

  const hasMore = page < totalPages;
  const loadMore = () => setPage(page + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Influencers</h1>
        <p className="text-muted-foreground mt-1">
          Find the perfect influencers for your next campaign
        </p>
      </div>

      {/* Search and Filters */}
      <InfluencerSearch
        params={params}
        onParamsChange={handleFilterChange}
      />

      {/* Results Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {total} influencers found
        </p>
      )}

      {/* Influencer Grid */}
      {isLoading && influencers.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {influencers.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {influencers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No influencers found matching your criteria.
              </p>
              <Button
                variant="link"
                onClick={() => updateParams({
                  page: 1,
                  limit: 12,
                  query: undefined,
                  niche: undefined,
                  minFollowers: undefined,
                  maxFollowers: undefined,
                  availability: undefined,
                  platform: undefined,
                })}
              >
                Clear filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
