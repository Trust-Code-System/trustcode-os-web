import { Avatar } from "@/components/ui/data-display";
import { company, companyTeam } from "@/lib/config/company";

export function CompanyTeam() {
  return (
    <section aria-labelledby="company-team-heading" className="surface-panel mb-6 p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="company-team-heading" className="text-base font-semibold">Founding team</h2>
          <p className="mt-1 text-sm text-text-secondary">Product, cloud, security, and delivery leads.</p>
        </div>
        <a href={`${company.website}/about`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand underline underline-offset-4">Company profiles<span className="sr-only"> (opens in a new tab)</span></a>
      </div>
      <ul className="grid gap-4 xl:grid-cols-2">
        {companyTeam.map((person) => (
          <li key={person.slug} className="flex min-w-0 gap-3 rounded-xl border p-4">
            <Avatar name={person.name} src={person.image} size="lg" />
            <div className="min-w-0">
              <h3 className="break-words text-sm font-semibold">{person.name}</h3>
              <p className="mt-1 text-sm text-text-secondary">Co-Founder · {person.title}</p>
              <p className="mt-2 text-xs text-text-secondary">{person.location}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-brand">
                <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">LinkedIn<span className="sr-only"> for {person.name} (opens in a new tab)</span></a>
                <a href={person.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">GitHub<span className="sr-only"> for {person.name} (opens in a new tab)</span></a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
