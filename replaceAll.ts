
export default function(text: string, search: string, replace: string) {
   return text.split(search).join(replace);
}