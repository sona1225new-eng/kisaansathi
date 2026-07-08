const { getWeather, getGeocode, getMandiPrices, getGovernmentSchemes, getAgricultureNews, getAiAssistantReply, detectDisease } = require('../services/externalApis');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getDashboardData = async (req, res) => {
  try {
    const city = req.query.city || req.user?.location || 'Madhepura';
    const [weather, mandi, schemes, news, geo] = await Promise.all([
      getWeather(city),
      getMandiPrices(city),
      getGovernmentSchemes(),
      getAgricultureNews(),
      getGeocode(city),
    ]);

    sendSuccess(res, { weather, mandi, schemes, news, geo });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.chatAssistant = async (req, res) => {
  try {
    const reply = await getAiAssistantReply(req.body.prompt || '');
    sendSuccess(res, reply);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.detectCropDisease = async (req, res) => {
  try {
    const imageBuffer = req.file ? req.file.buffer : Buffer.from('');
    const result = await detectDisease(imageBuffer, req.file?.mimetype || 'image/jpeg');
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
