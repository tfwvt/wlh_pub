/*
 * Site content for Wayne Herpich.
 *
 * Everything shown on the page comes from this file. No build step is needed:
 * edit, save, and reload.
 *
 * ADDING A NEW SECTION OF PAINTINGS
 *   Copy one of the blocks in `sections` below (from `{ title:` to its
 *   closing `},`), paste it where you want it to appear, change the title,
 *   and list the new images. Sections appear on the page in the order they
 *   are listed here, and each one gets its own link in the menu.
 *
 * IMAGES
 *   `file` is the image's name inside `imageBase` (the folder on
 *   wayneherpich.com where the photos already live). To use an image from
 *   somewhere else, put its full address in `src` instead of `file`.
 *
 *   `width` and `height` are optional. They're the image's size in pixels and
 *   let the page lay out the grid before the photos load. Without them the
 *   page measures each image as it loads.
 *
 *   You can also give any image a `title`, `year`, `medium` and `size`. These
 *   appear under the painting in the full-screen viewer. They're all
 *   optional, e.g.
 *     { file: "new_painting.jpg", title: "Untitled", year: 2026,
 *       medium: "Oil on canvas", size: "40 × 30 in" },
 */
window.SITE = {
  artist: {
    name: "Wayne Herpich",
    email: "angelbug@wayneherpich.com",
    instagram: "https://www.instagram.com/wayne_herpich_art/",
  },

  // Where images given by `file` are loaded from.
  imageBase: "https://wayneherpich.com/images/",

  // The large photo at the top of the page.
  hero: { file: "new-title-page.jpg", width: 800, height: 530, alt: "Black-and-white photograph of a house and overgrown yard, with a dog looking out of a basement window" },

  sections: [
    {
      title: "Paintings 1",
      // description: "Optional sentence or two shown under the section title.",
      images: [
        { file: "DSC_5943_0002.jpg", width: 704, height: 720 },
        { file: "DSC_5945_0003.jpg", width: 715, height: 720 },
        { file: "DSC_5947_0004.jpg", width: 707, height: 720 },
        { file: "DSC_5949_0005.jpg", width: 705, height: 720 },
        { file: "DSC_5951_0006.jpg", width: 703, height: 720 },
        { file: "DSC_5953_0007.jpg", width: 701, height: 720 },
        { file: "DSC_5955_0008.jpg", width: 707, height: 720 },
        { file: "DSC_5957_0009.jpg", width: 707, height: 720 },
        { file: "DSC_5959_0010.jpg", width: 705, height: 720 },
        { file: "DSC_5961_0011.jpg", width: 702, height: 720 },
        { file: "DSC_5963_0012.jpg", width: 705, height: 720 },
        { file: "DSC_5965_0013.jpg", width: 696, height: 720 },
        { file: "DSC_5967_0014.jpg", width: 702, height: 720 },
        { file: "DSC_5969_0015.jpg", width: 700, height: 720 },
        { file: "DSC_5971_0016.jpg", width: 703, height: 720 },
      ],
    },
    {
      title: "Paintings 2",
      images: [
        { file: "black_white_4.jpg", width: 339, height: 800 },
        { file: "black_white_5.jpg", width: 344, height: 800 },
        { file: "black_white_6.jpg", width: 343, height: 800 },
        { file: "black_white_7.jpg", width: 343, height: 800 },
        { file: "black_white_8.jpg", width: 358, height: 800 },
        { file: "black_white_9.jpg", width: 341, height: 800 },
        { file: "black_white_10.jpg", width: 394, height: 800 },
        { file: "black_white_11.jpg", width: 371, height: 800 },
        { file: "black_white_2.jpg", width: 800, height: 530 },
        { file: "black_white_3.jpg", width: 800, height: 530 },
        { file: "black_white_1.jpg", width: 800, height: 530 },
      ],
    },
    {
      title: "Paintings 3",
      images: [
        { file: "01_IMG_6925.jpg", width: 720, height: 689 },
        { file: "02_IMG_6927.jpg", width: 720, height: 759 },
        { file: "03_DSC05169.jpg", width: 720, height: 766 },
        { file: "04_IMG_6959.jpg", width: 720, height: 845 },
        { file: "05_DSC05167.jpg", width: 720, height: 840 },
        { file: "06_IMG_6924.jpg", width: 720, height: 674 },
        { file: "07_DSC05174.jpg", width: 720, height: 776 },
        { file: "08_IMG_6963.jpg", width: 720, height: 861 },
        { file: "09_IMG_6922.jpg", width: 720, height: 667 },
        { file: "10_DSC05177.jpg", width: 720, height: 826 },
        { file: "11_IMG_6920.jpg", width: 720, height: 686 },
        { file: "12_IMG_6932.jpg", width: 720, height: 766 },
        { file: "13_IMG_6961.jpg", width: 720, height: 943 },
        { file: "14_DSC05180.jpg", width: 720, height: 829 },
        { file: "15_IMG_6931.jpg", width: 720, height: 792 },
        { file: "16_IMG_6938.jpg", width: 720, height: 785 },
        { file: "17_DSC05178.jpg", width: 720, height: 841 },
        { file: "18_IMG_6923.jpg", width: 720, height: 663 },
        { file: "19_IMG_6928.jpg", width: 720, height: 789 },
        { file: "20_IMG_6939.jpg", width: 720, height: 771 },
        { file: "21_IMG_6960.jpg", width: 720, height: 822 },
        { file: "22_IMG_6935.jpg", width: 720, height: 787 },
        { file: "23_IMG_6921.jpg", width: 720, height: 672 },
        { file: "24_IMG_6937.jpg", width: 720, height: 772 },
        { file: "25_IMG_6942.jpg", width: 720, height: 772 },
        { file: "26_IMG_6953.jpg", width: 720, height: 991 },
        { file: "27_IMG_6954.jpg", width: 720, height: 967 },
        { file: "28_IMG_6955.jpg", width: 720, height: 987 },
        { file: "29_DSC05162.jpg", width: 720, height: 2408 },
        { file: "30_DSC05166.jpg", width: 720, height: 2422 },
        { file: "31_DSC05161.jpg", width: 720, height: 2459 },
        { file: "32_DSC05163.jpg", width: 720, height: 2472 },
        { file: "33_DSC05164.jpg", width: 720, height: 2477 },
        { file: "34_IMG_6943.jpg", width: 720, height: 2452 },
        { file: "35_IMG_6952.jpg", width: 720, height: 2379 },
      ],
    },
  ],
};
