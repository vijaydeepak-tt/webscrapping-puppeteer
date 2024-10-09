import puppeteer from 'puppeteer';
import fs from 'fs';

const scrap = async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  const allBooks = [];

  let currentPage = 1;
  const maxPages = 10;

  while (currentPage <= maxPages) {
    const url = `https://books.toscrape.com/catalogue/page-${currentPage}.html`;

    await page.goto(url);

    const books = await page.evaluate(() => {
      const bookEl = document.querySelectorAll('.product_pod');
      return Array.from(bookEl).map((book) => {
        const rating = book.querySelector('.star-rating').classList[1];
        const title = book.querySelector('h3 a').getAttribute('title');
        const link = `https://books.toscrape.com/${book
          .querySelector('h3 a')
          .getAttribute('href')}`;
        const price = book.querySelector('.price_color').textContent;
        const stock = book.querySelector('.instock.availability').textContent
          ? 'In stock'
          : 'Out of stock';

        return {
          title,
          price,
          rating,
          link,
          stock,
        };
      });
    });

    allBooks.push({
      page: currentPage,
      books,
    });
    currentPage++;
  }

  fs.writeFileSync('books.json', JSON.stringify(allBooks, null, 2));

  console.info('Books data stored in books.json file.');

  await browser.close();
};

scrap();
