import React, { useEffect, useState } from 'react';
import { Folder, Tag as TagIcon, X } from 'lucide-react';
import { getStoredUser } from '../../api/axiosClient';
import {
  categoryApi,
  slugify,
  tagApi,
  type ApiCategory,
  type ApiTag,
} from '../../api/taxonomyApi';

interface ContentTaxonomyProps {
  contentId: string;
}

interface Loaded {
  contentId: string; // which content this was loaded for
  allTags: ApiTag[];
  allCategories: ApiCategory[];
  tags: ApiTag[]; // attached to this content
  categories: ApiCategory[];
  error?: string;
}

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (msg) return msg;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

const selectClass =
  'text-xs px-2 py-1.5 border border-[#e8e7e4] rounded-md bg-white outline-none focus:border-[#5645d4] min-w-0';
const inputClass =
  'text-xs px-2 py-1.5 border border-[#e8e7e4] rounded-md outline-none focus:border-[#5645d4] min-w-0 flex-1';
const addButtonClass =
  'px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#5645d4] hover:bg-[#4534b3] text-white disabled:opacity-50 shrink-0';

const Chip: React.FC<{ icon: React.ReactNode; label: string; onRemove: () => void; disabled: boolean }> = ({
  icon,
  label,
  onRemove,
  disabled,
}) => (
  <span className="px-2 py-0.5 rounded-md bg-[#e4e9ec] text-[#5d5b54] text-xs flex items-center gap-1">
    {icon}
    <span>{label}</span>
    <button
      onClick={onRemove}
      disabled={disabled}
      aria-label={`Remove ${label}`}
      className="text-[#9b9a97] hover:text-[#ba1a1a] disabled:opacity-50"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export const ContentTaxonomy: React.FC<ContentTaxonomyProps> = ({ contentId }) => {
  const user = getStoredUser();
  const role = user?.role_name?.toLowerCase();
  // The API only lets Admin/Manager change the category tree; tags are open to everyone.
  const canCreateCategory = role === 'admin' || role === 'manager';

  const [data, setData] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [tagPick, setTagPick] = useState('');
  const [newTag, setNewTag] = useState('');
  const [catPick, setCatPick] = useState('');
  const [newCat, setNewCat] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      tagApi.list(),
      categoryApi.list(),
      tagApi.forContent(contentId),
      categoryApi.forContent(contentId),
    ])
      .then(([allTags, allCategories, tags, categories]) => {
        if (cancelled) return;
        setData({
          contentId,
          allTags: allTags.data,
          allCategories: allCategories.data,
          tags: tags.data,
          categories: categories.data,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setData({
          contentId,
          allTags: [],
          allCategories: [],
          tags: [],
          categories: [],
          error: errorMessage(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  if (data === null || data.contentId !== contentId) {
    return <p className="text-xs text-[#9b9a97]">Loading tags and categories…</p>;
  }
  if (data.error) {
    return <p className="text-xs text-[#ba1a1a]">Couldn't load tags and categories: {data.error}</p>;
  }

  const { allTags, allCategories, tags, categories } = data;

  // "Security › Guides" — categories can be nested, so show the full path.
  const byId = new Map(allCategories.map((c) => [c.category_id, c] as const));
  const pathOf = (c: ApiCategory): string => {
    const parts = [c.name];
    let cursor = c;
    for (let i = 0; i < 10 && cursor.parent_id; i++) {
      const parent = byId.get(cursor.parent_id);
      if (!parent) break;
      parts.unshift(parent.name);
      cursor = parent;
    }
    return parts.join(' › ');
  };
  const categoriesByPath = [...allCategories]
    .map((c) => ({ category: c, path: pathOf(c) }))
    .sort((a, b) => a.path.localeCompare(b.path));

  const attachedTagIds = new Set(tags.map((t) => t.tag_id));
  const attachedCategoryIds = new Set(categories.map((c) => c.category_id));
  const availableTags = allTags.filter((t) => !attachedTagIds.has(t.tag_id));
  const availableCategories = categoriesByPath.filter((c) => !attachedCategoryIds.has(c.category.category_id));

  const update = (fn: (prev: Loaded) => Loaded) => setData((prev) => (prev ? fn(prev) : prev));

  // Runs an API action with shared busy/error handling.
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const addTag = (tagId: string) =>
    run(async () => {
      await tagApi.attach(tagId, contentId);
      const tag = allTags.find((t) => t.tag_id === tagId);
      if (tag) update((d) => ({ ...d, tags: [...d.tags, tag] }));
      setTagPick('');
    });

  const removeTag = (tagId: string) =>
    run(async () => {
      await tagApi.detach(tagId, contentId);
      update((d) => ({ ...d, tags: d.tags.filter((t) => t.tag_id !== tagId) }));
    });

  const createTag = () =>
    run(async () => {
      const name = newTag.trim();
      if (!name) return;
      if (!slugify(name)) throw new Error('Tag names need at least one letter or number.');
      const created = (await tagApi.create(name)).data;
      await tagApi.attach(created.tag_id, contentId);
      update((d) => ({ ...d, allTags: [...d.allTags, created], tags: [...d.tags, created] }));
      setNewTag('');
    });

  const addCategory = (categoryId: string) =>
    run(async () => {
      await categoryApi.attach(categoryId, contentId);
      const category = allCategories.find((c) => c.category_id === categoryId);
      if (category) update((d) => ({ ...d, categories: [...d.categories, category] }));
      setCatPick('');
    });

  const removeCategory = (categoryId: string) =>
    run(async () => {
      await categoryApi.detach(categoryId, contentId);
      update((d) => ({ ...d, categories: d.categories.filter((c) => c.category_id !== categoryId) }));
    });

  const createCategory = () =>
    run(async () => {
      const name = newCat.trim();
      if (!name) return;
      const parent = newCatParent ? byId.get(newCatParent) : undefined;
      // Slugs are unique across all categories, so prefix with the parent's.
      const slug = slugify(parent ? `${parent.slug}-${name}` : name);
      if (!slug) throw new Error('Category names need at least one letter or number.');
      const created = (await categoryApi.create(name, slug, parent?.category_id ?? null)).data;
      await categoryApi.attach(created.category_id, contentId);
      update((d) => ({
        ...d,
        allCategories: [...d.allCategories, created],
        categories: [...d.categories, created],
      }));
      setNewCat('');
      setNewCatParent('');
    });

  return (
    <div className="space-y-4">
      {/* Tags */}
      <div>
        <span className="text-xs font-semibold text-[#9b9a97] uppercase block mb-2">Tags</span>
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {tags.length === 0 && <span className="text-xs text-[#9b9a97]">No tags yet.</span>}
          {tags.map((t) => (
            <Chip
              key={t.tag_id}
              icon={<TagIcon className="w-3 h-3" />}
              label={t.name}
              onRemove={() => removeTag(t.tag_id)}
              disabled={busy}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={tagPick}
            onChange={(e) => e.target.value && addTag(e.target.value)}
            disabled={busy || availableTags.length === 0}
            className={`${selectClass} w-36`}
            aria-label="Add an existing tag"
          >
            <option value="">{availableTags.length ? 'Add tag…' : 'No more tags'}</option>
            {availableTags.map((t) => (
              <option key={t.tag_id} value={t.tag_id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newTag.trim() && createTag()}
            placeholder="or create a new tag"
            maxLength={50}
            className={inputClass}
          />
          <button onClick={createTag} disabled={busy || !newTag.trim()} className={addButtonClass}>
            Add
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <span className="text-xs font-semibold text-[#9b9a97] uppercase block mb-2">Categories</span>
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {categories.length === 0 && <span className="text-xs text-[#9b9a97]">No categories yet.</span>}
          {categories.map((c) => (
            <Chip
              key={c.category_id}
              icon={<Folder className="w-3 h-3" />}
              label={pathOf(c)}
              onRemove={() => removeCategory(c.category_id)}
              disabled={busy}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={catPick}
            onChange={(e) => e.target.value && addCategory(e.target.value)}
            disabled={busy || availableCategories.length === 0}
            className={`${selectClass} w-full max-w-[260px]`}
            aria-label="Add an existing category"
          >
            <option value="">{availableCategories.length ? 'Add category…' : 'No more categories'}</option>
            {availableCategories.map(({ category, path }) => (
              <option key={category.category_id} value={category.category_id}>
                {path}
              </option>
            ))}
          </select>
        </div>

        {canCreateCategory && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newCat.trim() && createCategory()}
              placeholder="or create a new category"
              maxLength={100}
              className={inputClass}
            />
            <select
              value={newCatParent}
              onChange={(e) => setNewCatParent(e.target.value)}
              disabled={busy}
              className={`${selectClass} w-32`}
              aria-label="Parent category"
            >
              <option value="">No parent</option>
              {categoriesByPath.map(({ category, path }) => (
                <option key={category.category_id} value={category.category_id}>
                  {path}
                </option>
              ))}
            </select>
            <button onClick={createCategory} disabled={busy || !newCat.trim()} className={addButtonClass}>
              Add
            </button>
          </div>
        )}
      </div>

      {actionError && <p className="text-xs text-[#ba1a1a]">{actionError}</p>}
    </div>
  );
};
