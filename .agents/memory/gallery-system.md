---
name: Gallery & Download Management System
description: Architecture decisions for the gallery, collections, photo detail, storage, and cache system added in Session 4.
---

## Key decisions

### Photo metadata (CapturedPhoto)
All new fields are optional for backward compat with stored photos that pre-date this system.
Added: poseId, poseName, categoryId, categoryName, facingCamera, isFavorite, customName, collectionIds.
PhotoReviewModal now receives these from camera/[id].tsx and passes them to addPhoto.

### Collections
Separate `useCollectionsStore` (not merged into photos store). Default collections (Travel/Wedding/Instagram/Traditional/Family) are merged with any user-saved collections on loadCollections(). Creating a new collection picks an auto-color from COLLECTION_COLORS cycle.

### Gallery FlatList performance
`getItemLayout` was intentionally OMITTED — the dynamic ListHeaderComponent (search, chips, sort) makes offset computation unreliable. Performance is via removeClippedSubviews, windowSize=7, maxToRenderPerBatch, initialNumToRender.

### Gallery data loading
gallery.tsx calls loadPhotos() + loadCollections() in its own useEffect so it is self-sufficient even on direct navigation (no dependency on home/camera screen order).

### clearGallery() — collection consistency
clearGallery() in CacheService.ts must wipe photoIds from ALL collections when clearing photos, or stale membership counts appear. Uses direct Zustand setState cast + StorageService.setItem.

### Routes registered in _layout.tsx
- `photo/[id]` — fullScreenModal, headerShown: false
- `collection/[id]` — headerShown: false (custom header in component)
- `storage` — headerShown: true

### Startup initialization
_layout.tsx useEffect (after fonts): PosePackService.initialize() + useCollectionsStore.getState().loadCollections() — both non-fatal if they fail.

### expo-image vs Image
Photo detail screen (app/photo/[id].tsx) and PhotoReviewModal use `expo-image` (already installed ~3.0.11) for better caching and transition support.

### Share
PhotoReviewModal and photo detail use React Native's built-in `Share` API (no extra package needed).

### CacheService
Returns estimates only (no expo-file-system). AVG_PHOTO_BYTES=2.5MB, AVG_THUMBNAIL_BYTES=40KB. Device free storage shows N/A until expo-file-system is installed.
