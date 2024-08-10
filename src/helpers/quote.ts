import axios from 'axios';

interface Quote {
  text: string;
  author: string;
}

export async function fetchRandomQuote(): Promise<Quote> {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    const quote: Quote = {
      text: response.data.content,
      author: response.data.author,
    };
    return quote;
  } catch (error) {
    throw new Error('Could not fetch the quote');
  }
}
