import type {OptionType} from 'src/types/OptionType';
import slugify from 'slugify';

export function filterFunc(input: string, option?: OptionType) {
  return slugify(option?.searchValue ?? '')
    .toLowerCase()
    .includes(slugify(input.toLowerCase()));
}
