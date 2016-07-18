export default function(fileName: string, newExtension: string)
{
   return fileName.substr(0, fileName.lastIndexOf(".")) + newExtension;
}

