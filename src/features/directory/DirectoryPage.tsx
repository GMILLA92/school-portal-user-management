import { useUsersQuery } from '../users/api/useUsersQuery';

export const DirectoryPage = () => {
  const { data, isLoading, isError, error } = useUsersQuery();

  if (isLoading) return <div>Loading users…</div>;
  if (isError) return <div>Failed: {error.message}</div>;

  return (
    <div>
      <h1>Directory</h1>
      <p>Users loaded: {data?.length ?? 0}</p>
      <p>Next: Table UI + filters + actions</p>
    </div>
  );
};
