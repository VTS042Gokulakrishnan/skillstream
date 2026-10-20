const currencyModel = require("../models/currencyModels");
const industriesModel = require("../models/industriesModel");
const SkillModel = require("../models/skillsModel");
const axios = require("axios");
const blogModel = require("../models/blogsModel");
const blogsModel = require("../models/blogsModel");
const { ObjectId } = require("mongodb");
const moment = require("moment");
const Aws = require("aws-sdk");
const formidable = require("formidable");
const fs = require("fs");
const { tryCatch } = require("bullmq");

const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});
const controller = {
  async fetchCurrenies(req, res) {
    try {
      const fetchCurrency = await currencyModel.find({});
      // console.log(fetchCurrency);

      res.status(200).json({ fetchCurrency });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async fetchIndustries(req, res) {
    try {
      const fetchCountry = await industriesModel.find({}, { _id: 0 });
      // console.log(fetchCountry[0].industries);

      res.status(200).json({ industries: fetchCountry[0].industries.sort() });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async fetchSkills(req, res) {
    try {
      const fetchCountry = await SkillModel.find({}, { _id: 0 });

      // Extract and clean up the skills array
      let skills = fetchCountry[0]?.computer_sciences
        ?.filter((skill) => typeof skill === "string" && skill.trim() !== "")
        .map((skill) => skill.toUpperCase());

      // Remove duplicate skills
      const uniqueSkills = [...new Set(skills)];

      res.status(200).json({ skills: uniqueSkills.sort() });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async addSkills(req, res) {
    try {
      const skills = req.body.jobSkills;
      const fetchCountry = await SkillModel.updateOne(
        {},
        {
          $push: {
            computer_sciences: skills,
          },
        }
      );

      res.status(200).json({ message: "skill added", status: true });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async fetchLanguages(req, res) {
    try {
      const languages = [
        { code: "ab", name: "Abkhaz", nativeName: "аҧсуа" },
        { code: "aa", name: "Afar", nativeName: "Afaraf" },
        { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
        { code: "ak", name: "Akan", nativeName: "Akan" },
        { code: "sq", name: "Albanian", nativeName: "Shqip" },
        { code: "am", name: "Amharic", nativeName: "አማርኛ" },
        { code: "ar", name: "Arabic", nativeName: "العربية" },
        { code: "an", name: "Aragonese", nativeName: "Aragonés" },
        { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
        { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
        { code: "av", name: "Avaric", nativeName: "авар мацӀ, магӀарул мацӀ" },
        { code: "ae", name: "Avestan", nativeName: "avesta" },
        { code: "ay", name: "Aymara", nativeName: "aymar aru" },
        { code: "az", name: "Azerbaijani", nativeName: "azərbaycan dili" },
        { code: "bm", name: "Bambara", nativeName: "bamanankan" },
        { code: "ba", name: "Bashkir", nativeName: "башҡорт теле" },
        { code: "eu", name: "Basque", nativeName: "euskara, euskera" },
        { code: "be", name: "Belarusian", nativeName: "Беларуская" },
        { code: "bn", name: "Bengali", nativeName: "বাংলা" },
        { code: "bh", name: "Bihari", nativeName: "भोजपुरी" },
        { code: "bi", name: "Bislama", nativeName: "Bislama" },
        { code: "bs", name: "Bosnian", nativeName: "bosanski jezik" },
        { code: "br", name: "Breton", nativeName: "brezhoneg" },
        { code: "bg", name: "Bulgarian", nativeName: "български език" },
        { code: "my", name: "Burmese", nativeName: "ဗမာစာ" },
        { code: "ca", name: "Catalan; Valencian", nativeName: "Català" },
        { code: "ch", name: "Chamorro", nativeName: "Chamoru" },
        { code: "ce", name: "Chechen", nativeName: "нохчийн мотт" },
        {
          code: "ny",
          name: "Chichewa; Chewa; Nyanja",
          nativeName: "chiCheŵa, chinyanja",
        },
        {
          code: "zh",
          name: "Chinese",
          nativeName: "中文 (Zhōngwén), 汉语, 漢語",
        },
        { code: "cv", name: "Chuvash", nativeName: "чӑваш чӗлхи" },
        { code: "kw", name: "Cornish", nativeName: "Kernewek" },
        { code: "co", name: "Corsican", nativeName: "corsu, lingua corsa" },
        { code: "cr", name: "Cree", nativeName: "ᓀᐦᐃᔭᐍᐏᐣ" },
        { code: "hr", name: "Croatian", nativeName: "hrvatski" },
        { code: "cs", name: "Czech", nativeName: "česky, čeština" },
        { code: "da", name: "Danish", nativeName: "dansk" },
        {
          code: "dv",
          name: "Divehi; Dhivehi; Maldivian;",
          nativeName: "ދިވެހި",
        },
        { code: "nl", name: "Dutch", nativeName: "Nederlands, Vlaams" },
        { code: "en", name: "English", nativeName: "English" },
        { code: "eo", name: "Esperanto", nativeName: "Esperanto" },
        { code: "et", name: "Estonian", nativeName: "eesti, eesti keel" },
        { code: "ee", name: "Ewe", nativeName: "Eʋegbe" },
        { code: "fo", name: "Faroese", nativeName: "føroyskt" },
        { code: "fj", name: "Fijian", nativeName: "vosa Vakaviti" },
        { code: "fi", name: "Finnish", nativeName: "suomi, suomen kieli" },
        {
          code: "fr",
          name: "French",
          nativeName: "français, langue française",
        },
        {
          code: "ff",
          name: "Fula; Fulah; Pulaar; Pular",
          nativeName: "Fulfulde, Pulaar, Pular",
        },
        { code: "gl", name: "Galician", nativeName: "Galego" },
        { code: "ka", name: "Georgian", nativeName: "ქართული" },
        { code: "de", name: "German", nativeName: "Deutsch" },
        { code: "el", name: "Greek, Modern", nativeName: "Ελληνικά" },
        { code: "gn", name: "Guaraní", nativeName: "Avañeẽ" },
        { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
        {
          code: "ht",
          name: "Haitian; Haitian Creole",
          nativeName: "Kreyòl ayisyen",
        },
        { code: "ha", name: "Hausa", nativeName: "Hausa, هَوُسَ" },
        { code: "he", name: "Hebrew (modern)", nativeName: "עברית" },
        { code: "hz", name: "Herero", nativeName: "Otjiherero" },
        { code: "hi", name: "Hindi", nativeName: "हिन्दी, हिंदी" },
        { code: "ho", name: "Hiri Motu", nativeName: "Hiri Motu" },
        { code: "hu", name: "Hungarian", nativeName: "Magyar" },
        { code: "ia", name: "Interlingua", nativeName: "Interlingua" },
        { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
        {
          code: "ie",
          name: "Interlingue",
          nativeName:
            "Originally called Occidental; then Interlingue after WWII",
        },
        { code: "ga", name: "Irish", nativeName: "Gaeilge" },
        { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
        { code: "ik", name: "Inupiaq", nativeName: "Iñupiaq, Iñupiatun" },
        { code: "io", name: "Ido", nativeName: "Ido" },
        { code: "is", name: "Icelandic", nativeName: "Íslenska" },
        { code: "it", name: "Italian", nativeName: "Italiano" },
        { code: "iu", name: "Inuktitut", nativeName: "ᐃᓄᒃᑎᑐᑦ" },
        {
          code: "ja",
          name: "Japanese",
          nativeName: "日本語 (にほんご／にっぽんご)",
        },
        { code: "jv", name: "Javanese", nativeName: "basa Jawa" },
        {
          code: "kl",
          name: "Kalaallisut, Greenlandic",
          nativeName: "kalaallisut, kalaallit oqaasii",
        },
        { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
        { code: "kr", name: "Kanuri", nativeName: "Kanuri" },
        { code: "ks", name: "Kashmiri", nativeName: "कश्मीरी, كشميري‎" },
        { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі" },
        { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ" },
        { code: "ki", name: "Kikuyu, Gikuyu", nativeName: "Gĩkũyũ" },
        { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda" },
        { code: "ky", name: "Kirghiz, Kyrgyz", nativeName: "кыргыз тили" },
        { code: "kv", name: "Komi", nativeName: "коми кыв" },
        { code: "kg", name: "Kongo", nativeName: "KiKongo" },
        {
          code: "ko",
          name: "Korean",
          nativeName: "한국어 (韓國語), 조선말 (朝鮮語)",
        },
        { code: "ku", name: "Kurdish", nativeName: "Kurdî, كوردی‎" },
        { code: "kj", name: "Kwanyama, Kuanyama", nativeName: "Kuanyama" },
        { code: "la", name: "Latin", nativeName: "latine, lingua latina" },
        {
          code: "lb",
          name: "Luxembourgish, Letzeburgesch",
          nativeName: "Lëtzebuergesch",
        },
        { code: "lg", name: "Luganda", nativeName: "Luganda" },
        {
          code: "li",
          name: "Limburgish, Limburgan, Limburger",
          nativeName: "Limburgs",
        },
        { code: "ln", name: "Lingala", nativeName: "Lingála" },
        { code: "lo", name: "Lao", nativeName: "ພາສາລາວ" },
        { code: "lt", name: "Lithuanian", nativeName: "lietuvių kalba" },
        { code: "lu", name: "Luba-Katanga", nativeName: "" },
        { code: "lv", name: "Latvian", nativeName: "latviešu valoda" },
        { code: "gv", name: "Manx", nativeName: "Gaelg, Gailck" },
        { code: "mk", name: "Macedonian", nativeName: "македонски јазик" },
        { code: "mg", name: "Malagasy", nativeName: "Malagasy fiteny" },
        { code: "ms", name: "Malay", nativeName: "bahasa Melayu, بهاس ملايو‎" },
        { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
        { code: "mt", name: "Maltese", nativeName: "Malti" },
        { code: "mi", name: "Māori", nativeName: "te reo Māori" },
        { code: "mr", name: "Marathi (Marāṭhī)", nativeName: "मराठी" },
        { code: "mh", name: "Marshallese", nativeName: "Kajin M̧ajeļ" },
        { code: "mn", name: "Mongolian", nativeName: "монгол" },
        { code: "na", name: "Nauru", nativeName: "Ekakairũ Naoero" },
        {
          code: "nv",
          name: "Navajo, Navaho",
          nativeName: "Diné bizaad, Dinékʼehǰí",
        },
        { code: "nb", name: "Norwegian Bokmål", nativeName: "Norsk bokmål" },
        { code: "nd", name: "North Ndebele", nativeName: "isiNdebele" },
        { code: "ne", name: "Nepali", nativeName: "नेपाली" },
        { code: "ng", name: "Ndonga", nativeName: "Owambo" },
        { code: "nn", name: "Norwegian Nynorsk", nativeName: "Norsk nynorsk" },
        { code: "no", name: "Norwegian", nativeName: "Norsk" },
        { code: "ii", name: "Nuosu", nativeName: "ꆈꌠ꒿ Nuosuhxop" },
        { code: "nr", name: "South Ndebele", nativeName: "isiNdebele" },
        { code: "oc", name: "Occitan", nativeName: "Occitan" },
        { code: "oj", name: "Ojibwe, Ojibwa", nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ" },
        {
          code: "cu",
          name: "Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",
          nativeName: "ѩзыкъ словѣньскъ",
        },
        { code: "om", name: "Oromo", nativeName: "Afaan Oromoo" },
        { code: "or", name: "Oriya", nativeName: "ଓଡ଼ିଆ" },
        { code: "os", name: "Ossetian, Ossetic", nativeName: "ирон æвзаг" },
        { code: "pa", name: "Panjabi, Punjabi", nativeName: "ਪੰਜਾਬੀ, پنجابی‎" },
        { code: "pi", name: "Pāli", nativeName: "पाऴि" },
        { code: "fa", name: "Persian", nativeName: "فارسی" },
        { code: "pl", name: "Polish", nativeName: "polski" },
        { code: "ps", name: "Pashto, Pushto", nativeName: "پښتو" },
        { code: "pt", name: "Portuguese", nativeName: "Português" },
        { code: "qu", name: "Quechua", nativeName: "Runa Simi, Kichwa" },
        { code: "rm", name: "Romansh", nativeName: "rumantsch grischun" },
        { code: "rn", name: "Kirundi", nativeName: "kiRundi" },
        {
          code: "ro",
          name: "Romanian, Moldavian, Moldovan",
          nativeName: "română",
        },
        { code: "ru", name: "Russian", nativeName: "русский язык" },
        { code: "sa", name: "Sanskrit (Saṁskṛta)", nativeName: "संस्कृतम्" },
        { code: "sc", name: "Sardinian", nativeName: "sardu" },
        { code: "sd", name: "Sindhi", nativeName: "सिन्धी, سنڌي، سندھی‎" },
        { code: "se", name: "Northern Sami", nativeName: "Davvisámegiella" },
        { code: "sm", name: "Samoan", nativeName: "gagana faa Samoa" },
        { code: "sg", name: "Sango", nativeName: "yângâ tî sängö" },
        { code: "sr", name: "Serbian", nativeName: "српски језик" },
        { code: "gd", name: "Scottish Gaelic; Gaelic", nativeName: "Gàidhlig" },
        { code: "sn", name: "Shona", nativeName: "chiShona" },
        { code: "si", name: "Sinhala, Sinhalese", nativeName: "සිංහල" },
        { code: "sk", name: "Slovak", nativeName: "slovenčina" },
        { code: "sl", name: "Slovene", nativeName: "slovenščina" },
        { code: "so", name: "Somali", nativeName: "Soomaaliga, af Soomaali" },
        { code: "st", name: "Southern Sotho", nativeName: "Sesotho" },
        {
          code: "es",
          name: "Spanish; Castilian",
          nativeName: "español, castellano",
        },
        { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
        { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
        { code: "ss", name: "Swati", nativeName: "SiSwati" },
        { code: "sv", name: "Swedish", nativeName: "svenska" },
        { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
        { code: "te", name: "Telugu", nativeName: "తెలుగు" },
        { code: "tg", name: "Tajik", nativeName: "тоҷикӣ, toğikī, تاجیکی‎" },
        { code: "th", name: "Thai", nativeName: "ไทย" },
        { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ" },
        {
          code: "bo",
          name: "Tibetan Standard, Tibetan, Central",
          nativeName: "བོད་ཡིག",
        },
        { code: "tk", name: "Turkmen", nativeName: "Türkmen, Түркмен" },
        {
          code: "tl",
          name: "Tagalog",
          nativeName: "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔",
        },
        { code: "tn", name: "Tswana", nativeName: "Setswana" },
        { code: "to", name: "Tonga (Tonga Islands)", nativeName: "faka Tonga" },
        { code: "tr", name: "Turkish", nativeName: "Türkçe" },
        { code: "ts", name: "Tsonga", nativeName: "Xitsonga" },
        { code: "tt", name: "Tatar", nativeName: "татарча, tatarça, تاتارچا‎" },
        { code: "tw", name: "Twi", nativeName: "Twi" },
        { code: "ty", name: "Tahitian", nativeName: "Reo Tahiti" },
        {
          code: "ug",
          name: "Uighur, Uyghur",
          nativeName: "Uyƣurqə, ئۇيغۇرچە‎",
        },
        { code: "uk", name: "Ukrainian", nativeName: "українська" },
        { code: "ur", name: "Urdu", nativeName: "اردو" },
        { code: "uz", name: "Uzbek", nativeName: "zbek, Ўзбек, أۇزبېك‎" },
        { code: "ve", name: "Venda", nativeName: "Tshivenḓa" },
        { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
        { code: "vo", name: "Volapük", nativeName: "Volapük" },
        { code: "wa", name: "Walloon", nativeName: "Walon" },
        { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
        { code: "wo", name: "Wolof", nativeName: "Wollof" },
        { code: "fy", name: "Western Frisian", nativeName: "Frysk" },
        { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
        { code: "yi", name: "Yiddish", nativeName: "ייִדיש" },
        { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
        {
          code: "za",
          name: "Zhuang, Chuang",
          nativeName: "Saɯ cueŋƅ, Saw cuengh",
        },
      ];
      let allLanguages = [];
      languages.map((e, idx) => allLanguages.push(e.name));
      // console.log(allLanguages);

      res.status(200).json({ allLanguages });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async postBlogs(req, res) {
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
        maxFileSize: 500 * 1024 * 1024, // 500MB
      });
      await form.parse(req, async (err, fields, files) => {
        if (!files.file) {
          console.error("Video or PDF file is missing", err);
          return res
            .status(400)
            .json({ message: "Video or PDF file is missing", status: false });
        } else if (err) {
          console.error("Error parsing the file:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
        }
        const { topic, content, keyword } = fields;
        const { file } = files;
        const fileStream = fs.createReadStream(files.file.filepath);
        // console.log(fileStream);
        const params = {
          Bucket: `${process.env.AWS_BUCKET_NAME_IMAGE}/blogs-image`, // bucket that we made earlier
          Key: files.file.originalFilename, // Name of the image
          Body: fileStream, // Body which will contain the image in buffer format
          ACL: "public-read-write", // defining the permissions to get the public link
          ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
        };
        s3.upload(params, async (error, data) => {
          if (error) {
            console.log(error);
            res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
          } else {
            // console.log(data);
            const postBlog = await blogModel.create({
              topic: topic,
              content: content,
              keyword: keyword ? keyword : [],
              image: data.Location,
              date: moment().format("MMM DD,YYYY"),
            });
            res.status(201).json({ message: "Blogs Posted Successfully" });
          }
        });
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async fetchBlogs(req, res) {
    try {
      const findAll = await blogsModel.find({});
      const sort = findAll.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.status(200).json({ blogs: sort });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async fetchBlogSingle(req, res) {
    try {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      // console.log(objectId);
      const findAll = await blogsModel.findOne({ _id: objectId });
      res.status(200).json({ blogs: findAll });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async verifyCaptcha(req, res) {
    const { captchaToken } = req.body;
    // console.log(captchaToken);

    const secretKey = "6LcxaGYrAAAAANW5XqvjRlHP5cT8RI66s3CIw3bR";
    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
      );

      if (response.data.success) {
        res.status(200).json({ success: true });
      } else {
        res
          .status(400)
          .json({ success: false, errors: response.data["error-codes"] });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};
module.exports = controller;
