/*
 * Site content for Wayne Herpich.
 *
 * Every page of the site is built from this file. No build step is needed:
 * edit, save, and reload.
 *
 * ADDING A NEW SECTION OF PAINTINGS
 *   Copy one of the blocks in `sections` below (from `{ title:` to its
 *   closing `},`), paste it where you want it to appear, change the title,
 *   and list the new images. That's all: the section gets its own page
 *   (series.html?s=its-title), a card on the Work page and a link in the
 *   series menu. Sections are listed in the order they appear here.
 *
 * IMAGES
 *   `file` is the image's name inside `imageBase` (the folder on
 *   wayneherpich.com where the photos already live). To use an image from
 *   somewhere else, put its full address in `src` instead of `file`.
 *
 *   `width` and `height` are optional. They're the image's size in pixels and
 *   let the page lay out the wall before the photos load. Without them the
 *   page measures each image as it loads.
 *
 *   You can also give any image a `title`, `year`, `medium` and `size`. They
 *   appear as the painting's caption. They're all optional, e.g.
 *     { file: "new_painting.jpg", title: "Untitled", year: 2026,
 *       medium: "Oil on canvas", size: "40 × 30 in" },
 *
 * HOME PAGE
 *   `home.image` is the large photograph at the top of the home page.
 *
 * ABOUT AND CV
 *   `bio` is the paragraph(s) at the top of the About page. `cv` is a list
 *   of groups (Education, Exhibitions, ...), shown in order. To add a show or
 *   a review, copy a line in the right group, newest first. To add a whole
 *   new group, copy a `{ heading: ... }` block. In groups with
 *   `quoteTitles: true` (press), titles are shown in quotation marks. Any
 *   line can also have a `url` (e.g. a link to the review) to make its title
 *   a link.
 */
window.SITE = {
  artist: {
    name: "Wayne Herpich",
    location: "Torrington, Connecticut",
    email: "wayneherpich@gmail.com",
    instagram: "https://www.instagram.com/wayne_herpich_art/",
  },

  bio: [
    "Wayne Herpich is a painter who lives and works in Torrington, Connecticut. He studied painting at Pratt Institute (BFA, 1967) and the Yale School of Art and Architecture (MFA, 1969).",
    "His work has been shown in solo and group exhibitions in New York and Connecticut, and written about in Art in America and ARTnews.",
  ],

  cv: [
    {
      heading: "Education",
      items: [
        { year: 1969, title: "Master of Fine Arts in Painting", detail: "Yale School of Art and Architecture" },
        { year: 1967, title: "Bachelor of Fine Arts in Painting", detail: "Pratt Institute" },
      ],
    },
    {
      heading: "Solo Exhibitions",
      items: [
        { year: 2020, title: "New Paintings", detail: "Ober Gallery, Kent, CT" },
        { year: 2016, title: "Further Notice", detail: "Blackston Gallery, New York, NY" },
        { year: 2014, title: "New Vision Display", detail: "Blackston Gallery, New York, NY" },
        { year: 2013, title: "Solo Exhibition", detail: "The Switch Factory, Bantam, CT" },
        { year: 2012, title: "Solo Exhibition", detail: "Chad Etting Gallery, Torrington, CT" },
      ],
    },
    {
      heading: "Selected Group Exhibitions",
      items: [
        { year: 2024, title: "Western Figures", detail: "Five Points Gallery, Torrington, CT" },
        { year: 2019, title: "A Game", detail: "Five Points Gallery, Torrington, CT" },
        { year: 2017, title: "Figure This", detail: "Five Points Gallery, Torrington, CT" },
        { year: 2016, title: "More More More", detail: "Flinn Gallery, Greenwich, CT" },
        { year: 2016, title: "Abstraction Part I", detail: "Five Points Gallery, Torrington, CT" },
        { year: 2014, title: "Brushless", detail: "Morgan Lehman Gallery, New York, NY" },
        { year: 2012, title: "The New Abstractionists VI", detail: "Walter Wickiser Gallery, New York, NY" },
        { year: 2006, title: "The Small Panel Paintings", detail: "Walter Wickiser Gallery, New York, NY" },
      ],
    },
    {
      heading: "Featured Press",
      quoteTitles: true,
      items: [
        { year: 2014, title: "Wayne Herpich", detail: "Faye Hirsch, Art in America" },
      ],
    },
    {
      heading: "Selected Mentions and Reviews",
      quoteTitles: true,
      items: [
        { year: 2016, title: "Wayne Herpich: Further Notice at Blackson New York", detail: "ARTnews" },
        { year: 2016, title: "More More More Opens at the Flinn Gallery", detail: "Karen Sheer, Greenwich Free Press" },
        { year: 2014, title: "Exhibition at Morgan Lehman Explores the Margins of Painterly Process", detail: "ArtDaily" },
        { year: 2014, title: "Wayne Herpich", detail: "Jessica Jane Russel, Jessica Jane" },
        { year: 2014, title: "Like Wildfire", detail: "John Haber, Haber Arts" },
        { year: 2013, title: "Torrington Artist on Display", detail: "Ryan Flinn, The Register Citizen" },
      ],
    },
  ],

  // Where images given by `file` are loaded from.
  imageBase: "https://wayneherpich.com/images/",

  home: {
    // The large photograph at the top of the home page (the old site's front page).
    image: { file: "new-title-page.jpg", width: 800, height: 530, alt: "Black-and-white photograph of a house and overgrown yard, with a dog looking out of a basement window" },
  },

  // Photograph shown on the About page (it was the old site's front page).
  aboutImage: { file: "new-title-page.jpg", width: 800, height: 530, alt: "Black-and-white photograph of a house and overgrown yard, with a dog looking out of a basement window" },

  sections: [
    {
      title: "Paintings 1",
      // description: "Optional sentence or two shown on the series page.",
      // cover: "file_name.jpg",  (optional: the image on its Work card; otherwise the first)
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
