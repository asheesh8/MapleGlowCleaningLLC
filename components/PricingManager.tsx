'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tags,
} from 'lucide-react';
import type { CatalogAddOn, CatalogService } from '@/lib/catalog-types';

const ICON_OPTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'window', label: 'Window' },
  { id: 'grid', label: 'Tile/grid' },
  { id: 'droplet', label: 'Droplet' },
  { id: 'layers', label: 'Layers' },
  { id: 'box', label: 'Box' },
];

function includesFromText(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function servicePayload(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    name: String(fd.get('name') ?? ''),
    short: String(fd.get('short') ?? ''),
    description: String(fd.get('description') ?? ''),
    includes: includesFromText(fd.get('includes')),
    base: Number(fd.get('base') ?? 0),
    icon: String(fd.get('icon') ?? 'sparkles'),
    order: Number(fd.get('order') ?? 0),
    active: fd.get('active') === 'on',
  };
}

function addOnPayload(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    name: String(fd.get('name') ?? ''),
    price: Number(fd.get('price') ?? 0),
    order: Number(fd.get('order') ?? 0),
    active: fd.get('active') === 'on',
  };
}

function sortServices(items: CatalogService[]) {
  return [...items].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function sortAddOns(items: CatalogAddOn[]) {
  return [...items].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function PricingManager({
  initialServices,
  initialAddOns,
}: {
  initialServices: CatalogService[];
  initialAddOns: CatalogAddOn[];
}) {
  const router = useRouter();
  const [services, setServices] = useState(() => sortServices(initialServices));
  const [addOns, setAddOns] = useState(() => sortAddOns(initialAddOns));
  const [addingService, setAddingService] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveService(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setBusy(`service:${id}`);
    setError(null);
    setMessage(null);

    const res = await fetch(`/api/admin/catalog/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servicePayload(e.currentTarget)),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'Could not save that service.');
      setBusy(null);
      return;
    }

    setServices((items) =>
      sortServices(items.map((item) => (item.id === id ? data.service : item)))
    );
    setMessage(`${data.service.name} updated.`);
    setBusy(null);
    router.refresh();
  }

  async function createService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy('service:new');
    setError(null);
    setMessage(null);

    const form = e.currentTarget;
    const res = await fetch('/api/admin/catalog/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servicePayload(form)),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'Could not add that service.');
      setBusy(null);
      return;
    }

    setServices((items) => sortServices([...items, data.service]));
    form.reset();
    setAddingService(false);
    setMessage(`${data.service.name} added.`);
    setBusy(null);
    router.refresh();
  }

  async function saveAddOn(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setBusy(`addon:${id}`);
    setError(null);
    setMessage(null);

    const res = await fetch(`/api/admin/catalog/add-ons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addOnPayload(e.currentTarget)),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'Could not save that add-on.');
      setBusy(null);
      return;
    }

    setAddOns((items) => sortAddOns(items.map((item) => (item.id === id ? data.addOn : item))));
    setMessage(`${data.addOn.name} updated.`);
    setBusy(null);
    router.refresh();
  }

  async function createAddOn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy('addon:new');
    setError(null);
    setMessage(null);

    const form = e.currentTarget;
    const res = await fetch('/api/admin/catalog/add-ons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addOnPayload(form)),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'Could not add that add-on.');
      setBusy(null);
      return;
    }

    setAddOns((items) => sortAddOns([...items, data.addOn]));
    form.reset();
    setMessage(`${data.addOn.name} added.`);
    setBusy(null);
    router.refresh();
  }

  return (
    <main className="container-mg py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">Pricing & services</h1>
          <p className="mt-1.5 text-[14px] text-espresso-900/55">
            Changes here update the public service cards and booking estimates.
          </p>
        </div>
        <button
          onClick={() => setAddingService((value) => !value)}
          className="btn-maple !py-2.5 !text-[13.5px]"
        >
          <Plus className="h-4 w-4" />
          Add service
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-[13.5px] font-medium ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-sage-300 bg-sage-600/10 text-sage-700'
          }`}
        >
          {error ?? message}
        </div>
      )}

      {addingService && (
        <form onSubmit={createService} className="card mt-6 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold-600" />
            <h2 className="h-display text-2xl">New service</h2>
          </div>
          <ServiceFields
            service={{
              id: 'new',
              name: '',
              short: '',
              description: '',
              includes: [],
              base: 0,
              icon: 'sparkles',
              order: services.length,
              active: true,
            }}
          />
          <button
            type="submit"
            disabled={busy === 'service:new'}
            className="btn-primary mt-5 w-full sm:w-auto"
          >
            {busy === 'service:new' && <Loader2 className="h-4 w-4 animate-spin" />}
            Create service
          </button>
        </form>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gold-600" />
          <h2 className="h-display text-2xl">Services</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => {
            const saving = busy === `service:${service.id}`;
            return (
              <form key={service.id} onSubmit={(e) => saveService(e, service.id)} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-espresso-950">
                      {service.name || 'Untitled service'}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-espresso-900/45">
                      Public slug: {service.id}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      service.active
                        ? 'bg-sage-500 text-espresso-950'
                        : 'bg-espresso-900/10 text-espresso-900/50'
                    }`}
                  >
                    {service.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {service.active ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <ServiceFields service={service} />

                <button type="submit" disabled={saving} className="btn-ghost mt-5 w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save service'}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Tags className="h-5 w-5 text-gold-600" />
          <h2 className="h-display text-2xl">Add-ons</h2>
        </div>

        <div className="space-y-3">
          {addOns.map((addOn) => (
            <form
              key={addOn.id}
              onSubmit={(e) => saveAddOn(e, addOn.id)}
              className="card grid gap-3 p-4 sm:grid-cols-[minmax(0,1.4fr)_120px_100px_auto_auto] sm:items-end"
            >
              <div>
                <label className="label">Name</label>
                <input name="name" defaultValue={addOn.name} className="field" />
              </div>
              <div>
                <label className="label">Price</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={addOn.price}
                  className="field"
                />
              </div>
              <div>
                <label className="label">Order</label>
                <input
                  name="order"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={addOn.order}
                  className="field"
                />
              </div>
              <label className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border border-espresso-900/10 bg-cream-50 px-4 text-[13px] font-semibold text-espresso-900/70">
                <input name="active" type="checkbox" defaultChecked={addOn.active} />
                Visible
              </label>
              <button
                type="submit"
                disabled={busy === `addon:${addOn.id}`}
                className="btn-ghost min-h-[52px] !px-4 !py-2"
              >
                {busy === `addon:${addOn.id}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </form>
          ))}

          <form
            onSubmit={createAddOn}
            className="card grid gap-3 border-dashed p-4 sm:grid-cols-[minmax(0,1.4fr)_120px_100px_auto_auto] sm:items-end"
          >
            <div>
              <label className="label">New add-on</label>
              <input name="name" className="field" placeholder="Inside microwave" />
            </div>
            <div>
              <label className="label">Price</label>
              <input name="price" type="number" min="0" step="1" defaultValue={25} className="field" />
            </div>
            <div>
              <label className="label">Order</label>
              <input name="order" type="number" min="0" step="1" defaultValue={addOns.length} className="field" />
            </div>
            <label className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border border-espresso-900/10 bg-cream-50 px-4 text-[13px] font-semibold text-espresso-900/70">
              <input name="active" type="checkbox" defaultChecked />
              Visible
            </label>
            <button
              type="submit"
              disabled={busy === 'addon:new'}
              className="btn-primary min-h-[52px] !px-4 !py-2"
            >
              {busy === 'addon:new' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ServiceFields({ service }: { service: CatalogService }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Name</label>
        <input name="name" defaultValue={service.name} className="field" placeholder="Move-out cleaning" />
      </div>
      <div>
        <label className="label">Short label</label>
        <input name="short" defaultValue={service.short} className="field" placeholder="Apartment reset" />
      </div>
      <div>
        <label className="label">Base price</label>
        <input
          name="base"
          type="number"
          min="0"
          step="1"
          defaultValue={service.base}
          className="field"
        />
      </div>
      <div>
        <label className="label">Icon</label>
        <select name="icon" defaultValue={service.icon} className="field">
          {ICON_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Display order</label>
        <input
          name="order"
          type="number"
          min="0"
          step="1"
          defaultValue={service.order}
          className="field"
        />
      </div>
      <label className="flex min-h-[52px] items-center gap-2 self-end rounded-2xl border border-espresso-900/10 bg-cream-50 px-4 text-[13px] font-semibold text-espresso-900/70">
        <input name="active" type="checkbox" defaultChecked={service.active} />
        Visible on site
      </label>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={service.description}
          className="field resize-none"
          placeholder="What Katie does for this service..."
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Included items, one per line</label>
        <textarea
          name="includes"
          rows={5}
          defaultValue={service.includes.join('\n')}
          className="field resize-y"
          placeholder="Kitchens reset&#10;Floors vacuumed and mopped&#10;Bathrooms sanitized"
        />
      </div>
    </div>
  );
}
