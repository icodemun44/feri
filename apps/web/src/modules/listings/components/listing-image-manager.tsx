"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Alert, Button, Spinner } from "@feri/ui";
import { MAX_PRODUCT_IMAGES } from "@feri/shared";
import type { ListingImageView } from "../listing.types";

type ListingImageManagerProps = {
  productId: string;
  images: readonly ListingImageView[];
};

type ErrorBody = { message?: unknown };

const GENERIC_UPLOAD_ERROR = "We could not upload that photo. Please try again.";
const PHOTO_FIELD_NAME = "photo";

const readErrorMessage = async (response: Response): Promise<string> => {
  const body: ErrorBody = await response.json().catch(() => ({}));
  return typeof body.message === "string" ? body.message : GENERIC_UPLOAD_ERROR;
};

export const ListingImageManager = ({ productId, images }: ListingImageManagerProps) => {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const remainingSlots = MAX_PRODUCT_IMAGES - images.length;
  const baseUrl = `/api/seller/listings/${productId}/images`;

  const uploadPhotos = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFiles = Array.from(event.target.files ?? []).slice(0, remainingSlots);
    event.target.value = "";
    if (selectedFiles.length === 0) {
      return;
    }
    setIsBusy(true);
    setErrorMessage(null);
    for (const file of selectedFiles) {
      const body = new FormData();
      body.set(PHOTO_FIELD_NAME, file);
      const response = await fetch(baseUrl, { method: "POST", body }).catch(() => null);
      if (!response?.ok) {
        setErrorMessage(response ? await readErrorMessage(response) : GENERIC_UPLOAD_ERROR);
        break;
      }
    }
    setIsBusy(false);
    router.refresh();
  };

  const removePhoto = async (imageId: string): Promise<void> => {
    setIsBusy(true);
    setErrorMessage(null);
    const response = await fetch(`${baseUrl}/${imageId}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setErrorMessage(response ? await readErrorMessage(response) : GENERIC_UPLOAD_ERROR);
    }
    setIsBusy(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <li
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-muted"
          >
            <img src={image.url} alt={image.altText ?? ""} className="size-full object-cover" />
            {index === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink">
                Cover
              </span>
            ) : null}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void removePhoto(image.id)}
              aria-label="Remove photo"
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-surface text-ink hover:bg-danger-soft hover:text-danger disabled:opacity-50"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      {remainingSlots > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(event) => void uploadPhotos(event)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={() => fileInput.current?.click()}
          >
            {isBusy ? <Spinner /> : <ImagePlus aria-hidden="true" className="size-4" />}
            Add photos
          </Button>
          <p className="text-sm text-muted">
            JPG, PNG or WebP, up to 5 MB each. {remainingSlots} more allowed. The first photo is the
            cover.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">
          You have added the maximum of {MAX_PRODUCT_IMAGES} photos.
        </p>
      )}
    </div>
  );
};
