// ═══════════════════════════════════════════════════════════
// Countries and Nationalities List
// Comprehensive list of countries around the globe
// Includes phone country codes and flag emojis
// ═══════════════════════════════════════════════════════════

export interface Country {
    code: string;
    name: string;
    nationality: string;
    phoneCode: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    { code: "AF", name: "Afghanistan", nationality: "Afghan", phoneCode: "+93", flag: "🇦🇫" },
    { code: "AL", name: "Albania", nationality: "Albanian", phoneCode: "+355", flag: "🇦🇱" },
    { code: "DZ", name: "Algeria", nationality: "Algerian", phoneCode: "+213", flag: "🇩🇿" },
    { code: "AD", name: "Andorra", nationality: "Andorran", phoneCode: "+376", flag: "🇦🇩" },
    { code: "AO", name: "Angola", nationality: "Angolan", phoneCode: "+244", flag: "🇦🇴" },
    { code: "AG", name: "Antigua and Barbuda", nationality: "Antiguan/Barbudan", phoneCode: "+1-268", flag: "🇦🇬" },
    { code: "AR", name: "Argentina", nationality: "Argentine", phoneCode: "+54", flag: "🇦🇷" },
    { code: "AM", name: "Armenia", nationality: "Armenian", phoneCode: "+374", flag: "🇦🇲" },
    { code: "AU", name: "Australia", nationality: "Australian", phoneCode: "+61", flag: "🇦🇺" },
    { code: "AT", name: "Austria", nationality: "Austrian", phoneCode: "+43", flag: "🇦🇹" },
    { code: "AZ", name: "Azerbaijan", nationality: "Azerbaijani", phoneCode: "+994", flag: "🇦🇿" },
    { code: "BS", name: "Bahamas", nationality: "Bahamian", phoneCode: "+1-242", flag: "🇧🇸" },
    { code: "BH", name: "Bahrain", nationality: "Bahraini", phoneCode: "+973", flag: "🇧🇭" },
    { code: "BD", name: "Bangladesh", nationality: "Bangladeshi", phoneCode: "+880", flag: "🇧🇩" },
    { code: "BB", name: "Barbados", nationality: "Barbadian", phoneCode: "+1-246", flag: "🇧🇧" },
    { code: "BY", name: "Belarus", nationality: "Belarusian", phoneCode: "+375", flag: "🇧🇾" },
    { code: "BE", name: "Belgium", nationality: "Belgian", phoneCode: "+32", flag: "🇧🇪" },
    { code: "BZ", name: "Belize", nationality: "Belizean", phoneCode: "+501", flag: "🇧🇿" },
    { code: "BJ", name: "Benin", nationality: "Beninese", phoneCode: "+229", flag: "🇧🇯" },
    { code: "BT", name: "Bhutan", nationality: "Bhutanese", phoneCode: "+975", flag: "🇧🇹" },
    { code: "BO", name: "Bolivia", nationality: "Bolivian", phoneCode: "+591", flag: "🇧🇴" },
    { code: "BA", name: "Bosnia and Herzegovina", nationality: "Bosnian/Herzegovinian", phoneCode: "+387", flag: "🇧🇦" },
    { code: "BW", name: "Botswana", nationality: "Botswanan", phoneCode: "+267", flag: "🇧🇼" },
    { code: "BR", name: "Brazil", nationality: "Brazilian", phoneCode: "+55", flag: "🇧🇷" },
    { code: "BN", name: "Brunei", nationality: "Bruneian", phoneCode: "+673", flag: "🇧🇳" },
    { code: "BG", name: "Bulgaria", nationality: "Bulgarian", phoneCode: "+359", flag: "🇧🇬" },
    { code: "BF", name: "Burkina Faso", nationality: "Burkinabé", phoneCode: "+226", flag: "🇧🇫" },
    { code: "BI", name: "Burundi", nationality: "Burundian", phoneCode: "+257", flag: "🇧🇮" },
    { code: "KH", name: "Cambodia", nationality: "Cambodian", phoneCode: "+855", flag: "🇰🇭" },
    { code: "CM", name: "Cameroon", nationality: "Cameroonian", phoneCode: "+237", flag: "🇨🇲" },
    { code: "CA", name: "Canada", nationality: "Canadian", phoneCode: "+1", flag: "🇨🇦" },
    { code: "CV", name: "Cape Verde", nationality: "Cape Verdean", phoneCode: "+238", flag: "🇨🇻" },
    { code: "CF", name: "Central African Republic", nationality: "Central African", phoneCode: "+236", flag: "🇨🇫" },
    { code: "TD", name: "Chad", nationality: "Chadian", phoneCode: "+235", flag: "🇹🇩" },
    { code: "CL", name: "Chile", nationality: "Chilean", phoneCode: "+56", flag: "🇨🇱" },
    { code: "CN", name: "China", nationality: "Chinese", phoneCode: "+86", flag: "🇨🇳" },
    { code: "CO", name: "Colombia", nationality: "Colombian", phoneCode: "+57", flag: "🇨🇴" },
    { code: "KM", name: "Comoros", nationality: "Comorian", phoneCode: "+269", flag: "🇰🇲" },
    { code: "CG", name: "Congo", nationality: "Congolese", phoneCode: "+242", flag: "🇨🇬" },
    { code: "CD", name: "Congo (Democratic Republic)", nationality: "Congolese", phoneCode: "+243", flag: "🇨🇩" },
    { code: "CR", name: "Costa Rica", nationality: "Costa Rican", phoneCode: "+506", flag: "🇨🇷" },
    { code: "HR", name: "Croatia", nationality: "Croatian", phoneCode: "+385", flag: "🇭🇷" },
    { code: "CU", name: "Cuba", nationality: "Cuban", phoneCode: "+53", flag: "🇨🇺" },
    { code: "CY", name: "Cyprus", nationality: "Cypriot", phoneCode: "+357", flag: "🇨🇾" },
    { code: "CZ", name: "Czech Republic", nationality: "Czech", phoneCode: "+420", flag: "🇨🇿" },
    { code: "DK", name: "Denmark", nationality: "Danish", phoneCode: "+45", flag: "🇩🇰" },
    { code: "DJ", name: "Djibouti", nationality: "Djiboutian", phoneCode: "+253", flag: "🇩🇯" },
    { code: "DM", name: "Dominica", nationality: "Dominican", phoneCode: "+1-767", flag: "🇩🇲" },
    { code: "DO", name: "Dominican Republic", nationality: "Dominican", phoneCode: "+1-809", flag: "🇩🇴" },
    { code: "EC", name: "Ecuador", nationality: "Ecuadorian", phoneCode: "+593", flag: "🇪🇨" },
    { code: "EG", name: "Egypt", nationality: "Egyptian", phoneCode: "+20", flag: "🇪🇬" },
    { code: "SV", name: "El Salvador", nationality: "Salvadoran", phoneCode: "+503", flag: "🇸🇻" },
    { code: "GQ", name: "Equatorial Guinea", nationality: "Equatorial Guinean", phoneCode: "+240", flag: "🇬🇶" },
    { code: "ER", name: "Eritrea", nationality: "Eritrean", phoneCode: "+291", flag: "🇪🇷" },
    { code: "EE", name: "Estonia", nationality: "Estonian", phoneCode: "+372", flag: "🇪🇪" },
    { code: "ET", name: "Ethiopia", nationality: "Ethiopian", phoneCode: "+251", flag: "🇪🇹" },
    { code: "FJ", name: "Fiji", nationality: "Fijian", phoneCode: "+679", flag: "🇫🇯" },
    { code: "FI", name: "Finland", nationality: "Finnish", phoneCode: "+358", flag: "🇫🇮" },
    { code: "FR", name: "France", nationality: "French", phoneCode: "+33", flag: "🇫🇷" },
    { code: "GA", name: "Gabon", nationality: "Gabonese", phoneCode: "+241", flag: "🇬🇦" },
    { code: "GM", name: "Gambia", nationality: "Gambian", phoneCode: "+220", flag: "🇬🇲" },
    { code: "GE", name: "Georgia", nationality: "Georgian", phoneCode: "+995", flag: "🇬🇪" },
    { code: "DE", name: "Germany", nationality: "German", phoneCode: "+49", flag: "🇩🇪" },
    { code: "GH", name: "Ghana", nationality: "Ghanaian", phoneCode: "+233", flag: "🇬🇭" },
    { code: "GR", name: "Greece", nationality: "Greek", phoneCode: "+30", flag: "🇬🇷" },
    { code: "GD", name: "Grenada", nationality: "Grenadian", phoneCode: "+1-473", flag: "🇬🇩" },
    { code: "GT", name: "Guatemala", nationality: "Guatemalan", phoneCode: "+502", flag: "🇬🇹" },
    { code: "GN", name: "Guinea", nationality: "Guinean", phoneCode: "+224", flag: "🇬🇳" },
    { code: "GW", name: "Guinea-Bissau", nationality: "Guinean", phoneCode: "+245", flag: "🇬🇼" },
    { code: "GY", name: "Guyana", nationality: "Guyanese", phoneCode: "+592", flag: "🇬🇾" },
    { code: "HT", name: "Haiti", nationality: "Haitian", phoneCode: "+509", flag: "🇭🇹" },
    { code: "HN", name: "Honduras", nationality: "Honduran", phoneCode: "+504", flag: "🇭🇳" },
    { code: "HK", name: "Hong Kong", nationality: "Hong Kong", phoneCode: "+852", flag: "🇭🇰" },
    { code: "HU", name: "Hungary", nationality: "Hungarian", phoneCode: "+36", flag: "🇭🇺" },
    { code: "IS", name: "Iceland", nationality: "Icelandic", phoneCode: "+354", flag: "🇮🇸" },
    { code: "IN", name: "India", nationality: "Indian", phoneCode: "+91", flag: "🇮🇳" },
    { code: "ID", name: "Indonesia", nationality: "Indonesian", phoneCode: "+62", flag: "🇮🇩" },
    { code: "IR", name: "Iran", nationality: "Iranian", phoneCode: "+98", flag: "🇮🇷" },
    { code: "IQ", name: "Iraq", nationality: "Iraqi", phoneCode: "+964", flag: "🇮🇶" },
    { code: "IE", name: "Ireland", nationality: "Irish", phoneCode: "+353", flag: "🇮🇪" },
    { code: "IL", name: "Israel", nationality: "Israeli", phoneCode: "+972", flag: "🇮🇱" },
    { code: "IT", name: "Italy", nationality: "Italian", phoneCode: "+39", flag: "🇮🇹" },
    { code: "CI", name: "Ivory Coast", nationality: "Ivorian", phoneCode: "+225", flag: "🇨🇮" },
    { code: "JM", name: "Jamaica", nationality: "Jamaican", phoneCode: "+1-876", flag: "🇯🇲" },
    { code: "JP", name: "Japan", nationality: "Japanese", phoneCode: "+81", flag: "🇯🇵" },
    { code: "JO", name: "Jordan", nationality: "Jordanian", phoneCode: "+962", flag: "🇯🇴" },
    { code: "KZ", name: "Kazakhstan", nationality: "Kazakhstani", phoneCode: "+7", flag: "🇰🇿" },
    { code: "KE", name: "Kenya", nationality: "Kenyan", phoneCode: "+254", flag: "🇰🇪" },
    { code: "KI", name: "Kiribati", nationality: "I-Kiribati", phoneCode: "+686", flag: "🇰🇮" },
    { code: "KP", name: "Korea, North", nationality: "North Korean", phoneCode: "+850", flag: "🇰🇵" },
    { code: "KR", name: "Korea, South", nationality: "South Korean", phoneCode: "+82", flag: "🇰🇷" },
    { code: "KW", name: "Kuwait", nationality: "Kuwaiti", phoneCode: "+965", flag: "🇰🇼" },
    { code: "KG", name: "Kyrgyzstan", nationality: "Kyrgyz", phoneCode: "+996", flag: "🇰🇬" },
    { code: "LA", name: "Laos", nationality: "Laotian", phoneCode: "+856", flag: "🇱🇦" },
    { code: "LV", name: "Latvia", nationality: "Latvian", phoneCode: "+371", flag: "🇱🇻" },
    { code: "LB", name: "Lebanon", nationality: "Lebanese", phoneCode: "+961", flag: "🇱🇧" },
    { code: "LS", name: "Lesotho", nationality: "Sotho", phoneCode: "+266", flag: "🇱🇸" },
    { code: "LR", name: "Liberia", nationality: "Liberian", phoneCode: "+231", flag: "🇱🇷" },
    { code: "LY", name: "Libya", nationality: "Libyan", phoneCode: "+218", flag: "🇱🇾" },
    { code: "LI", name: "Liechtenstein", nationality: "Liechtensteiner", phoneCode: "+423", flag: "🇱🇮" },
    { code: "LT", name: "Lithuania", nationality: "Lithuanian", phoneCode: "+370", flag: "🇱🇹" },
    { code: "LU", name: "Luxembourg", nationality: "Luxembourger", phoneCode: "+352", flag: "🇱🇺" },
    { code: "MO", name: "Macau", nationality: "Macanese", phoneCode: "+853", flag: "🇲🇴" },
    { code: "MK", name: "Macedonia", nationality: "Macedonian", phoneCode: "+389", flag: "🇲🇰" },
    { code: "MG", name: "Madagascar", nationality: "Malagasy", phoneCode: "+261", flag: "🇲🇬" },
    { code: "MW", name: "Malawi", nationality: "Malawian", phoneCode: "+265", flag: "🇲🇼" },
    { code: "MY", name: "Malaysia", nationality: "Malaysian", phoneCode: "+60", flag: "🇲🇾" },
    { code: "MV", name: "Maldives", nationality: "Maldivian", phoneCode: "+960", flag: "🇲🇻" },
    { code: "ML", name: "Mali", nationality: "Malian", phoneCode: "+223", flag: "🇲🇱" },
    { code: "MT", name: "Malta", nationality: "Maltese", phoneCode: "+356", flag: "🇲🇹" },
    { code: "MH", name: "Marshall Islands", nationality: "Marshallese", phoneCode: "+692", flag: "🇲🇭" },
    { code: "MQ", name: "Martinique", nationality: "Martiniquais", phoneCode: "+596", flag: "🇲🇶" },
    { code: "MR", name: "Mauritania", nationality: "Mauritanian", phoneCode: "+222", flag: "🇲🇷" },
    { code: "MU", name: "Mauritius", nationality: "Mauritian", phoneCode: "+230", flag: "🇲🇺" },
    { code: "MX", name: "Mexico", nationality: "Mexican", phoneCode: "+52", flag: "🇲🇽" },
    { code: "FM", name: "Micronesia", nationality: "Micronesian", phoneCode: "+691", flag: "🇫🇲" },
    { code: "MD", name: "Moldova", nationality: "Moldovan", phoneCode: "+373", flag: "🇲🇩" },
    { code: "MC", name: "Monaco", nationality: "Monégasque", phoneCode: "+377", flag: "🇲🇨" },
    { code: "MN", name: "Mongolia", nationality: "Mongolian", phoneCode: "+976", flag: "🇲🇳" },
    { code: "ME", name: "Montenegro", nationality: "Montenegrin", phoneCode: "+382", flag: "🇲🇪" },
    { code: "MA", name: "Morocco", nationality: "Moroccan", phoneCode: "+212", flag: "🇲🇦" },
    { code: "MZ", name: "Mozambique", nationality: "Mozambican", phoneCode: "+258", flag: "🇲🇿" },
    { code: "MM", name: "Myanmar", nationality: "Burmese", phoneCode: "+95", flag: "🇲🇲" },
    { code: "NA", name: "Namibia", nationality: "Namibian", phoneCode: "+264", flag: "🇳🇦" },
    { code: "NR", name: "Nauru", nationality: "Nauruan", phoneCode: "+674", flag: "🇳🇷" },
    { code: "NP", name: "Nepal", nationality: "Nepalese", phoneCode: "+977", flag: "🇳🇵" },
    { code: "NL", name: "Netherlands", nationality: "Dutch", phoneCode: "+31", flag: "🇳🇱" },
    { code: "NZ", name: "New Zealand", nationality: "New Zealand", phoneCode: "+64", flag: "🇳🇿" },
    { code: "NI", name: "Nicaragua", nationality: "Nicaraguan", phoneCode: "+505", flag: "🇳🇮" },
    { code: "NE", name: "Niger", nationality: "Nigerien", phoneCode: "+227", flag: "🇳🇪" },
    { code: "NG", name: "Nigeria", nationality: "Nigerian", phoneCode: "+234", flag: "🇳🇬" },
    { code: "NO", name: "Norway", nationality: "Norwegian", phoneCode: "+47", flag: "🇳🇴" },
    { code: "OM", name: "Oman", nationality: "Omani", phoneCode: "+968", flag: "🇴🇲" },
    { code: "PK", name: "Pakistan", nationality: "Pakistani", phoneCode: "+92", flag: "🇵🇰" },
    { code: "PW", name: "Palau", nationality: "Palauan", phoneCode: "+680", flag: "🇵🇼" },
    { code: "PS", name: "Palestine", nationality: "Palestinian", phoneCode: "+970", flag: "🇵🇸" },
    { code: "PA", name: "Panama", nationality: "Panamanian", phoneCode: "+507", flag: "🇵🇦" },
    { code: "PG", name: "Papua New Guinea", nationality: "Papua New Guinean", phoneCode: "+675", flag: "🇵🇬" },
    { code: "PY", name: "Paraguay", nationality: "Paraguayan", phoneCode: "+595", flag: "🇵🇾" },
    { code: "PE", name: "Peru", nationality: "Peruvian", phoneCode: "+51", flag: "🇵🇪" },
    { code: "PH", name: "Philippines", nationality: "Filipino", phoneCode: "+63", flag: "🇵🇭" },
    { code: "PL", name: "Poland", nationality: "Polish", phoneCode: "+48", flag: "🇵🇱" },
    { code: "PT", name: "Portugal", nationality: "Portuguese", phoneCode: "+351", flag: "🇵🇹" },
    { code: "QA", name: "Qatar", nationality: "Qatari", phoneCode: "+974", flag: "🇶🇦" },
    { code: "RE", name: "Reunion", nationality: "Reunionese", phoneCode: "+262", flag: "🇷🇪" },
    { code: "RO", name: "Romania", nationality: "Romanian", phoneCode: "+40", flag: "🇷🇴" },
    { code: "RU", name: "Russia", nationality: "Russian", phoneCode: "+7", flag: "🇷🇺" },
    { code: "RW", name: "Rwanda", nationality: "Rwandan", phoneCode: "+250", flag: "🇷🇼" },
    { code: "KN", name: "Saint Kitts and Nevis", nationality: "Kittitian/Nevisian", phoneCode: "+1-869", flag: "🇰🇳" },
    { code: "LC", name: "Saint Lucia", nationality: "Saint Lucian", phoneCode: "+1-758", flag: "🇱🇨" },
    { code: "VC", name: "Saint Vincent and the Grenadines", nationality: "Vincentian", phoneCode: "+1-784", flag: "🇻🇨" },
    { code: "WS", name: "Samoa", nationality: "Samoan", phoneCode: "+685", flag: "🇼🇸" },
    { code: "SM", name: "San Marino", nationality: "Sammarinese", phoneCode: "+378", flag: "🇸🇲" },
    { code: "ST", name: "São Tomé and Príncipe", nationality: "São Toméan", phoneCode: "+239", flag: "🇸🇹" },
    { code: "SA", name: "Saudi Arabia", nationality: "Saudi Arabian", phoneCode: "+966", flag: "🇸🇦" },
    { code: "SN", name: "Senegal", nationality: "Senegalese", phoneCode: "+221", flag: "🇸🇳" },
    { code: "RS", name: "Serbia", nationality: "Serbian", phoneCode: "+381", flag: "🇷🇸" },
    { code: "SC", name: "Seychelles", nationality: "Seychellois", phoneCode: "+248", flag: "🇸🇨" },
    { code: "SL", name: "Sierra Leone", nationality: "Sierra Leonean", phoneCode: "+232", flag: "🇸🇱" },
    { code: "SG", name: "Singapore", nationality: "Singaporean", phoneCode: "+65", flag: "🇸🇬" },
    { code: "SK", name: "Slovakia", nationality: "Slovak", phoneCode: "+421", flag: "🇸🇰" },
    { code: "SI", name: "Slovenia", nationality: "Slovenian", phoneCode: "+386", flag: "🇸🇮" },
    { code: "SB", name: "Solomon Islands", nationality: "Solomon Islander", phoneCode: "+677", flag: "🇸🇧" },
    { code: "SO", name: "Somalia", nationality: "Somali", phoneCode: "+252", flag: "🇸🇴" },
    { code: "ZA", name: "South Africa", nationality: "South African", phoneCode: "+27", flag: "🇿🇦" },
    { code: "SS", name: "South Sudan", nationality: "South Sudanese", phoneCode: "+211", flag: "🇸🇸" },
    { code: "ES", name: "Spain", nationality: "Spanish", phoneCode: "+34", flag: "🇪🇸" },
    { code: "LK", name: "Sri Lanka", nationality: "Sri Lankan", phoneCode: "+94", flag: "🇱🇰" },
    { code: "SD", name: "Sudan", nationality: "Sudanese", phoneCode: "+249", flag: "🇸🇩" },
    { code: "SR", name: "Suriname", nationality: "Surinamese", phoneCode: "+597", flag: "🇸🇷" },
    { code: "SZ", name: "Eswatini", nationality: "Swati", phoneCode: "+268", flag: "🇸🇿" },
    { code: "SE", name: "Sweden", nationality: "Swedish", phoneCode: "+46", flag: "🇸🇪" },
    { code: "CH", name: "Switzerland", nationality: "Swiss", phoneCode: "+41", flag: "🇨🇭" },
    { code: "SY", name: "Syria", nationality: "Syrian", phoneCode: "+963", flag: "🇸🇾" },
    { code: "TW", name: "Taiwan", nationality: "Taiwanese", phoneCode: "+886", flag: "🇹🇼" },
    { code: "TJ", name: "Tajikistan", nationality: "Tajikistani", phoneCode: "+992", flag: "🇹🇯" },
    { code: "TZ", name: "Tanzania", nationality: "Tanzanian", phoneCode: "+255", flag: "🇹🇿" },
    { code: "TH", name: "Thailand", nationality: "Thai", phoneCode: "+66", flag: "🇹🇭" },
    { code: "TL", name: "Timor-Leste", nationality: "Timorese", phoneCode: "+670", flag: "🇹🇱" },
    { code: "TG", name: "Togo", nationality: "Togolese", phoneCode: "+228", flag: "🇹🇬" },
    { code: "TO", name: "Tonga", nationality: "Tongan", phoneCode: "+676", flag: "🇹🇴" },
    { code: "TT", name: "Trinidad and Tobago", nationality: "Trinidadian/Tobagonian", phoneCode: "+1-868", flag: "🇹🇹" },
    { code: "TN", name: "Tunisia", nationality: "Tunisian", phoneCode: "+216", flag: "🇹🇳" },
    { code: "TR", name: "Turkey", nationality: "Turkish", phoneCode: "+90", flag: "🇹🇷" },
    { code: "TM", name: "Turkmenistan", nationality: "Turkmen", phoneCode: "+993", flag: "🇹🇲" },
    { code: "TV", name: "Tuvalu", nationality: "Tuvaluan", phoneCode: "+688", flag: "🇹🇻" },
    { code: "UG", name: "Uganda", nationality: "Ugandan", phoneCode: "+256", flag: "🇺🇬" },
    { code: "UA", name: "Ukraine", nationality: "Ukrainian", phoneCode: "+380", flag: "🇺🇦" },
    { code: "AE", name: "United Arab Emirates", nationality: "Emirati", phoneCode: "+971", flag: "🇦🇪" },
    { code: "GB", name: "United Kingdom", nationality: "British", phoneCode: "+44", flag: "🇬🇧" },
    { code: "US", name: "United States", nationality: "American", phoneCode: "+1", flag: "🇺🇸" },
    { code: "UY", name: "Uruguay", nationality: "Uruguayan", phoneCode: "+598", flag: "🇺🇾" },
    { code: "UZ", name: "Uzbekistan", nationality: "Uzbekistani", phoneCode: "+998", flag: "🇺🇿" },
    { code: "VU", name: "Vanuatu", nationality: "Vanuatuan", phoneCode: "+678", flag: "🇻🇺" },
    { code: "VA", name: "Vatican City", nationality: "Vatican", phoneCode: "+39-06", flag: "🇻🇦" },
    { code: "VE", name: "Venezuela", nationality: "Venezuelan", phoneCode: "+58", flag: "🇻🇪" },
    { code: "VN", name: "Vietnam", nationality: "Vietnamese", phoneCode: "+84", flag: "🇻🇳" },
    { code: "YE", name: "Yemen", nationality: "Yemeni", phoneCode: "+967", flag: "🇾🇪" },
    { code: "ZM", name: "Zambia", nationality: "Zambian", phoneCode: "+260", flag: "🇿🇲" },
    { code: "ZW", name: "Zimbabwe", nationality: "Zimbabwean", phoneCode: "+263", flag: "🇿🇼" },
];

export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find((c) => c.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
    return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
};

export const getCountryByNationality = (nationality: string): Country | undefined => {
    return COUNTRIES.find((c) => c.nationality.toLowerCase() === nationality.toLowerCase());
};

export const getNationalityByCountry = (countryName: string): string => {
    const country = getCountryByName(countryName);
    return country ? country.nationality : "";
};

/**
 * Get phone code by country code
 */
export const getPhoneCodeByCountry = (code: string): string | undefined => {
    return COUNTRIES.find((c) => c.code === code)?.phoneCode;
};

/**
 * Get phone code by nationality
 */
export const getPhoneCodeByNationality = (nationality: string): string | undefined => {
    return COUNTRIES.find((c) => c.nationality.toLowerCase() === nationality.toLowerCase())?.phoneCode;
};

/**
 * Get flag by country code
 */
export const getFlagByCountry = (code: string): string | undefined => {
    return COUNTRIES.find((c) => c.code === code)?.flag;
};
