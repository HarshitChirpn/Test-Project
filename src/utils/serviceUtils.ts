// Utility functions for service-related operations

/**
 * Creates a consistent title slug from a service title
 * @param title - The service title
 * @returns A URL-friendly slug
 */
export const createTitleSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

/**
 * Finds a service by its title slug
 * @param services - Array of services
 * @param slug - The title slug to search for
 * @returns The matching service or undefined
 */
export const findServiceBySlug = (services: any[], slug: string) => {
  return services.find((service) => {
    const serviceTitleSlug = createTitleSlug(service.title);
    return serviceTitleSlug === slug;
  });
};
