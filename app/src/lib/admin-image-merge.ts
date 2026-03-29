type PlacementOptions = {
  necklaceCenterX?: number;
  necklaceCenterY?: number;
  necklaceWidthRatio?: number;
  verticalOffsetRatio?: number;
  useOpenRouter?: boolean;
  openrouterPrompt?: string;
  openrouterModel?: string;
};

export async function mergeJewelryOnModel(
  jewelryFile: File,
  modelFile: File,
  options?: PlacementOptions,
) {
  const baseUrl = import.meta.env.VITE_MERGE_API_URL ?? 'http://127.0.0.1:8001';
  const envUseOpenRouter = String(import.meta.env.VITE_USE_OPENROUTER ?? '').toLowerCase() === 'true';
  const envOpenRouterModel = import.meta.env.VITE_OPENROUTER_MODEL as string | undefined;
  const envOpenRouterPrompt = import.meta.env.VITE_OPENROUTER_PROMPT as string | undefined;
  const formData = new FormData();
  formData.append('jewelry_image', jewelryFile);
  formData.append('model_image', modelFile);

  if (typeof options?.necklaceCenterX === 'number') {
    formData.append('necklace_center_x', String(options.necklaceCenterX));
  }
  if (typeof options?.necklaceCenterY === 'number') {
    formData.append('necklace_center_y', String(options.necklaceCenterY));
  }
  if (typeof options?.necklaceWidthRatio === 'number') {
    formData.append('necklace_width_ratio', String(options.necklaceWidthRatio));
  }
  if (typeof options?.verticalOffsetRatio === 'number') {
    formData.append('vertical_offset_ratio', String(options.verticalOffsetRatio));
  }

  const useOpenRouter = options?.useOpenRouter ?? envUseOpenRouter;
  if (useOpenRouter) {
    formData.append('use_openrouter', 'true');
    const model = options?.openrouterModel ?? envOpenRouterModel;
    const prompt = options?.openrouterPrompt ?? envOpenRouterPrompt;
    if (model) {
      formData.append('openrouter_model', model);
    }
    if (prompt) {
      formData.append('openrouter_prompt', prompt);
    }
  }

  const response = await fetch(`${baseUrl}/merge-images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to merge images.');
  }

  const data = (await response.json()) as {
    normalImage?: string;
    hoverImage?: string;
  };

  if (!data.normalImage || !data.hoverImage) {
    throw new Error('Merge API did not return both normal and hover images.');
  }

  return {
    normalImage: data.normalImage,
    hoverImage: data.hoverImage,
  };
}
