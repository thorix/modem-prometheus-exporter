// JavaScript Document

/********************************************************************************
 *
 *  Entry Validation
 *
 ********************************************************************************/
 
 	$(document).ready(validateEntries);  // This should be placed at the end of the load() function

function validateEntries()
{
	/**************************************************************************************************************
	 *
	 * The validateEntries function will check each element on the page with the class "userEntry" each
	 * time the element changes.  The value of the element is checked based upon one of the entry type classes:
	 *			SSID
	 *			WpaPassPhrase
	 *			WepPhrase
	 *			WpsPin
	 *			MacAddr
	 *			Number
	 *			IPmask
	 *			IPaddr
	 *			WepKey
	 *
	 * If the entry is invalid, a line with the ID of the format "elementid"_errorLine is shown and the color of the 
	 * entry is made red.
	 *
	 * If the entry is valid, the error line is hidden and the the normal color of the entry is restored.
	 *
	 ***************************************************************************************************************/

	$(document).ready(function(e) {

		$(".errorLine").hide();
		$("p.errorHighlight").hide();
		
		

		$(".userEntry").change(function()
		{
			var	ErrorRowId;
			var	ButtonId
			var	Result=true;
			var CombinedRowId;
			var	OtherID;
			
			ErrorRowId = "#"+$(this).attr("id")+"_errorLine";
			ErrorTextId = $(this).attr("id")+"_errorText";
			ButtonId = $(this).attr("id")+"_button";
	
			if (!($(this).attr("disabled") ) )	// Don't check fields that are disabled
			{
				if		($(this).hasClass("SSID")) 			Result=isValidSsid( $(this) )
				else if	($(this).hasClass("WpaPassPhrase")) Result=isValidWpaPassphrase( $(this) )
				else if	($(this).hasClass("WepPhrase")) 	Result=isValidWepPassphrase( $(this) )
				else if	($(this).hasClass("WpsPin")) 		Result=isValidWpsPin( $(this).val() )
				else if	($(this).hasClass("MacAddr")) 		Result=isValidMacAddr( $(this) )
				else if	($(this).hasClass("Number")) 		Result=isNum( $(this).val() )
				else if	($(this).hasClass("IPmask")) 		Result=isValidIPaddr( 	$(this).val(),
																					ErrorTextId, true )
				else if	($(this).hasClass("IPaddr")) 		Result=isValidIPaddr( 	$(this).val(),
																					ErrorTextId, false )
				else if	($(this).hasClass("WepKey")) 		
				{
					if ( $("#64bitWEP").is(":checked") )
					{
						Result=isValidWepKey( $(this), 1 );
					}
					else
					{
						Result=isValidWepKey( $(this), 2 );
					}
				}
				else if ($(this).hasClass("WepKeyGN"))
				{
				     if ( $('input:radio[name=WepEncryptionSizeGN]:checked').val() == 1)
				     {
                                         Result = isValidWepKey ($(this), 1);
				     }
				     else
				     {
                                         Result = isValidWepKey( $(this), 2);
				     }
				}
				;
			}
			if(Result)
			{
				$(this).parent().find('p').hide();
				$(this).removeClass("errorHighlight");
				if (window.changeHandler)
				{
					changeHandler($(this));
				}
			}
			else
			{ 
				$(this).parent().find('p').show();
				$(this).addClass("errorHighlight");
			}
		});
	});

}

function isValidIPaddr(IPaddr, errorLineID, IPmask)
{
	var	lcv = 0;
	var	result = true;
	var firstOctet,
		secondOctet,
		thirdOctet,
		forthOctet;
	var firstOctetPresent = false,
		secondOctetPresent = false,
		thirdOctetPresent = false,
		forthOctetPresent = false;	
	var	errorText = "Error - OOPS";
	

	/************************
	 * Get the first octet
	 ************************/
	firstOctet = getOctet();
	firstOctetPresent = !(firstOctet=="");
	if (!firstOctetPresent || !isNum(firstOctet) || !((firstOctet * 1) < 256) )
	{
		result = false;
	}

	/************************
	 * Get the second octet
	 ************************/
	secondOctet = getOctet();
	secondOctetPresent = !(secondOctet=="");
	if (!secondOctetPresent || !isNum(secondOctet) || !((secondOctet * 1) < 256) )
	{
		result = false;
	}

	/************************
	 * Get the third octet
	 ************************/
	thirdOctet = getOctet();
	thirdOctetPresent = !(thirdOctet=="");
	if (!thirdOctetPresent || !isNum(thirdOctet) || !((thirdOctet * 1) < 256) )
	{
		result = false;
	}

	/************************
	 * Get the forth octet
	 ************************/
	forthOctet = getOctet();
	forthOctetPresent = !(forthOctet=="");
	if (!forthOctetPresent || !isNum(forthOctet) || !((forthOctet * 1) < 256) )
	{
		result = false;
	}

	if (!result)
	{
		errorText =	"Error - Network Address must be four numbers (0-255) seperated by a decimal point";
	}
/*
 * Test for valid network addresses
 */
	if ( (result==true) && (IPmask==false) )
	{ 
	 	if (!(( (firstOctet == 192) && (secondOctet == 168) ) || 
							(firstOctet == 10)	))
		{
			result = false;
			errorText = "Error - Network must start with either 10 or 192.168";
		}
	}
//	document.getElementById(errorLineID).innerHTML = errorText;

	return (result)
	
	function getOctet()
	{
		var	octet = "";
		
	
		while (lcv < IPaddr.length && (IPaddr[lcv] != ".") && result)
		{
			octet = octet + IPaddr[lcv];
			if ( !isNum(IPaddr[lcv++]) )
			{
				result = false;
			}
		}
		lcv++;
		return (octet);
	}
}


function isNetworkConfigValid(ServerAddress, NetStart, NetMask, NetEnd)
{
	var errorMessage="";
	var	hexServAddr,
		hexNetStrAddr,
		hexNetMsk,
		hexNetEndAddr;
	var	NetSize;
	var	masked1,
		masked2;
	var result = true;
	
	hexServAddr = IPtoHex(ServerAddress);
	hexNetStrAddr = IPtoHex(NetStart);
	hexNetMsk = IPtoHex(NetMask);
	hexNetEndAddr = IPtoHex(NetEnd);

	NetSize = parseInt(invert(hexNetMsk),16);

/*
 * Check that all of the addresses are within the same network
 */
	if ( (hexServAddr & hexNetMsk) != (hexNetStrAddr & hexNetMsk) ||
		 (hexServAddr & hexNetMsk) != (hexNetEndAddr & hexNetMsk) )
	{
		// one address is outside the network
		result = false;
	}

/*
 * Check to make sure that the End is after the Start
 */	
	if (hexNetStrAddr >= hexNetEndAddr)
	{
		result = false;
		alert("The Network Ending Address must be larger than the Network Start Address.");
	}

/*
 * Checkk to make sure that the server address is not between the start and end
 */
 	if ( (hexServAddr >= hexNetStrAddr) && (hexServAddr <= hexNetEndAddr) )
	{
		result = false;
		alert("The Network IP Address can not be between the Network Start Address and the Network End Address.");
	}
	
	return (result);
}

function invert(input)
{
	var	lcv;
	var	output="0x";

		for (lcv = 2;
		 lcv < input.length;
		 lcv++)
	{
		switch (input[lcv])
		{
			case "0":
				output += "f";
				break;

			case "1":
				output += "e";
				break;

			case "2":
				output += "d";
				break;

			case "3":
				output += "c";
				break;

			case "4":
				output += "b";
				break;

			case "5":
				output += "a";
				break;

			case "6":
				output += "9";
				break;

			case "7":
				output += "8";
				break;

			case "8":
				output += "7";
				break;

			case "9":
				output += "6";
				break;

			case "a":
			case "A":
				output += "5";
				break;

			case "b":
			case "B":
				output += "4";
				break;

			case "c":
			case "C":
				output += "3";
				break;

			case "d":
			case "D":
				output += "2";
				break;

			case "e":
			case "E":
				output += "1";
				break;

			case "f":
			case "F":
				output += "0";
				break;
		}
	}
	return (output);
}


function IPtoHex(addr)
{
	var output="0x";
	var	octet;
	var	lcv;
	var	hex;
	
	for (	lcv = 0, octet="";
			lcv < addr.length;
			lcv++)
	{
		if (addr[lcv] != ".")
		{
			octet += addr[lcv];
		}
		else
		{
			// convert to hex
			hex = Number(octet).toString(16);
			if (hex.length == 1)
			{
				output += "0";
			}
			output += hex;
			octet = ""
		}
	}
	hex = Number(octet).toString(16);
	if (hex.length == 1)
	{
		output += "0";
	}
	output += hex;

	return (output);
}

function isValidLocalIPaddr(IPaddr)
{
	var	result = { "valid" : true, "errorText" : ""};
	var	octet = IPaddr.split('.');

	for (var lcv = 0;
		 lcv < 4;
		 lcv++)
	{
		if (octet[lcv] == "" || octet[lcv] < 0 || octet[lcv] > 255 || !isNum(octet[lcv]) )
		{
			result.valid = false;
			result.errorText = "The IP address must be four numbers from 0 to 255, " +
								"separated by decimal points. Example: 192.168.1.1";
		}
	}

	// Check for valid starting point of a local address
	//		192.168.x.x or 10.x.x.x or 172.16-31.x.x
	if (result.valid)
	{
		if (!(isValidAlicense(octet) || isValidBlicense(octet) || isValidClicense(octet) ) )
		{
			result.valid = false;
			result.errorText = "The Local IP address must start with either 10 or 192.168 " +
								"or it must begin with 172 with the second number be from 16 to 31.";
		}
	}
	return (result);
}

function isValidAlicense(octet)
{
	return (octet[0] == 10);
}

function isValidBlicense(octet)
{
	return ( (octet[0] == 192) && (octet[1] == 168) );
}

function isValidClicense(octet)
{
	return ( (octet[0] == 172) && (octet[1] >= 16) && octet[1] <= 31);
}

function isValidGlobalIPaddr(IPaddr)
{
	var	result = { "valid" : true, "errorText" : ""};
	var	octet = IPaddr.split('.');

	for (var lcv = 0;
		 lcv < 4;
		 lcv++)
	{
		if (octet[lcv] == "" || octet[lcv] < 0 || octet[lcv] > 255 || !isNum(octet[lcv]) )
		{
			result.valid = false;
			result.errorText = "The IP address must be four numbers between 0 and 255, seperated by a decimal point.";
		}
	}
	return (result);
}

function isValidPort(port)
{
	var	result = { "valid" : true, "errorText" : ""};
	if (port < 1 || port > 65535 || !isNum(port) )
	{
		result.errorText = "The port number must be a number between 1 and 65535";
		result.valid = false;
	}
	return (result)
}

function isValidLowOctet(octet)
{
	var	result = { "valid" : true, "errorText" : ""};
	if (octet < 2 || octet > 254 || !isNum(octet) )
	{
		result.errorText = "The last number in the IP address must be between 2 and 254";
		result.valid = false;
	}
	return (result)
}

function isValidMacAddr(userEntryObject)
{
	var	result=true;
	var	MacErrorText;
	var MACaddr;
	var	string;

	string = $(userEntryObject).val();

	MACaddr = $(userEntryObject).val();
	MacErrorText = checkMAC( MACaddr ); 
	if ( MacErrorText != "OK" )
	{
		$(userEntryObject).parent().find('p').html(MacErrorText);
		result = false;
	}
	else
	{
		$(userEntryObject).parent().find(".errorHighlight").html("");
	}
	return (result);
}

function checkMAC(MAC)
{
	//**************************************************************************************************
	//
	//	Purpose: This function will validate the entry of a standard MAC address by checking that it:
	//					1. is 17 Characters long
	//					2. is 6 Hexadecimal octets seperated by a colon
	//	Input: The ID of the MAC Address element
	//	Output: "OK" if good, "Error" followed by an error description if not good
	//
	//**************************************************************************************************
	
	var	lcv;
	var result="OK"; 

	if (MAC.length != 0)
	{
		if (MAC.length != 17)
		{
			result = "Error: MAC Addresses must be of the form xx:xx:xx:xx:xx:xx"
		}
		else for (	lcv=0;
					lcv<MAC.length  && (result=="OK");
					lcv++)
		{
			if ((lcv+1) % 3 != 0)
			{	// This character should be a Hexadecimal character
				if ( !isHex(MAC.charAt(lcv)) )
				{
					result = "Error: BAD Character entry";
				}
			}
			else
			{	// This character should be a colon
				if (MAC.charAt(lcv) != ':')
				{
					result = "Error: BAD Character entry";
				}
			}
		}
	}
	
	return(result);
}
	
function isValidSsid(SSIDobject)
{
	/* 
	 * The rules for a valid SSID are:
	 *		- Between 1 and 32 number of characters
	 *		- Characters must be alphanuymeric
	 *		- SSID is case sensitive (Not relevent to this function
	 *
	 * Input:	The SSID string to be validated
	 * Output:	Returns "true" if it is a valid SSID, otherwise false
	 */
	 var	Result = true;
	 var	SSID
	 
	 SSID = $(SSIDobject).val();
	 
	 if ( (SSID.length > 32) || (!isPrintableAscii(SSID) ) || (SSID.length == 0) )
	 {
		 Result = false;
	 }

		if (SSID.length > 32)
		{
			$(SSIDobject).parent().find('p').html("Error - SSID can not have more than 32 characters");
		}

		if (!isPrintableAscii(SSID) )
		{
			$(SSIDobject).parent().find('p').html("Error - Illeagal character");
		}

		if (SSID.length == 0)
		{
			$(SSIDobject).parent().find('p').html("Error - SSID has not been entered");
		}

	 return (Result);
}

function isValidSSID(SSID)
{
	/* 
	 * The rules for a valid SSID are:
	 *		- Between 1 and 32 number of characters
	 *		- Characters must be alphanuymeric
	 *		- SSID is case sensitive (Not relevent to this function
	 *
	 * Input:	The SSID string to be validated
	 * Output:	Returns "true" if it is a valid SSID, otherwise false
	 */
	 var	Result = true;

	 if ( (SSID.length > 32) || (!isPrintableAscii(SSID) ) || (SSID.length == 0) )
	 {
		 Result = false;
	 }

	 return (Result);
}

function isValidPassphrase(passphrase)
{
	/* 
	 * The rules for a valid WPA Passphrase are:
	 *		- Between 8 and 64 characters long
	 *		- Characters must be printable ASCII characters
	 *		- Passphrase is case sensitive (Not relevent to this function
	 *
	 * Input:	The Passphrase string to be validated
	 * Output:	Returns "true" if it is a valid Passphrase, otherwise false
	 */
	 
	var Result = true;

	if ( (passphrase.length < 8) ||
		 (passphrase.length > 64) ||
		 (!isPrintableAscii(passphrase)) )
	{
		Result = false;
	}

	return (Result);
}

function isValidWpaPassphrase(passphraseObject)
{
	/* 
	 * The rules for a valid WPA Passphrase are:
	 *		- Between 8 and 64 characters long
	 *		- Characters must be printable ASCII characters
	 *		- Passphrase is case sensitive (Not relevent to this function
	 *
	 * Input:	The Passphrase string to be validated
	 * Output:	Returns "true" if it is a valid Passphrase, otherwise false
	 */
	 
	var Result = true;
	var	Passphrase;
	
	Passphrase = $(passphraseObject).val();

	if ( (Passphrase.length < 8) ||
		 (Passphrase.length > 64) ||
		 (!isPrintableAscii(Passphrase)) )
	{
		Result = false;

		if (Passphrase.length < 8)
		{
			$(passphraseObject).parent().find('p').html("The Passphrase must be at least 8 characters long.");
		}
		else if (Passphrase.length > 64)
		{
			$(passphraseObject).parent().find('p').html("The Passphrase must be no more than 64 characters long.");
		}
		else
		{
			$(passphraseObject).parent().find('p').html("The Passphrase must be printable characters.");
		}
	}
	
	return (Result);
}

function isValidWepKey(keyObject, EncryptionSize)
{
	/* 
	 * The rules for a valid WEP Key are:
	 *		- Characters must be Hex characters
	 * 		- Keys must be:
	 *			- 10 Hex (or 5 ASCII) characters long for 64 bit WEP encryption
	 *			- 26 Hex (or 13 ASCII) characters long for 128 bit WEP encryption
	 *
	 * Input:	The Key string to be validated
	 * Output:	Returns "true" if it is a valid Key, otherwise false
	 */

	var Result = true;
	var Size;
	var	Key;
	
	Key = $(keyObject).val();
	
	
	if (EncryptionSize == 1)
	{
		Size = 10
		$(keyObject).parent().find('p').html("Error - Network key must be 10 Hexadecimal characters");
	}
	else
	{
		Size = 26;
		$(keyObject).parent().find('p').html("Error - Network key must be 26 Hexadecimal characters");
	}

	if (Key.length == 0)
	{
		$(keyObject).next("input").prop('disabled', true);
		$(keyObject).next("input").prop('checked', false);
	}
	else
	{
		$(keyObject).next("input").prop('disabled', false);
		if (Key.length != Size/2)
		{
			if ( (Key.length != Size) || (!isHex(Key) ) )
			{
				Result = false;
				$(keyObject).next("input").prop('disabled', true); 
				$(keyObject).next("input").prop('checked', false);
			}
		}
	}
	
	return (Result);
}

function isValidWepPassphrase(Passphrase)
{
	var Result = true;
	
	if (Passphrase.length != 0)
		Result = (isValidWpaPassphrase(Passphrase));
	return (Result)
}

function isHex(Hex)
{
	var	lcv;
	var	Result = true;
		
	for (lcv = 0;
		 lcv < Hex.length && Result;
		 lcv++)
	{
		if ( !((Hex.charAt(lcv) >= '0' && Hex.charAt(lcv) <= '9') ||
			   (Hex.charAt(lcv) >= 'A' && Hex.charAt(lcv) <= 'F') ||
			   (Hex.charAt(lcv) >= 'a' && Hex.charAt(lcv) <= 'f')) )
		{
			Result = false;
		}
	}
	return (Result);
}

function isPrintableAscii(Ascii)
{	 
	 var lcv;
	 var Result = true;
	 
	 for (lcv = 0;
	 	  lcv < Ascii.length && Result;
		  lcv++)
	{
		if ( !(Ascii.charAt(lcv) >= ' ' && Ascii.charAt(lcv) <= '~'))
		{
			Result = false;
		}
	}
	return (Result)
}

function isAlphaNum(AlphaNum)
{	 
	var lcv;
	var Result = true;

	for (lcv = 0;
		 lcv < AlphaNum.length && Result;
		 lcv++)
	{
		if ( !((AlphaNum.charAt(lcv) >= '0' && AlphaNum.charAt(lcv) <= '9') ||
			   (AlphaNum.charAt(lcv) >= 'A' && AlphaNum.charAt(lcv) <= 'Z') ||
			   (AlphaNum.charAt(lcv) >= 'a' && AlphaNum.charAt(lcv) <= 'z')) )
		{
			Result = false;
		}
	}
	return (Result)
}

function isNum(Num)
{	 
	var lcv;
	var Result = true;

	if (Num == undefined)
	{
		Result = false;
	}
	else
	{
		for (lcv = 0;
			 lcv < Num.length && Result;
			 lcv++)
		{
			if ( !(Num.charAt(lcv) >= '0' && Num.charAt(lcv) <= '9') )
			{
				Result = false;
			}
		}
	}
	return (Result)
}

function isValidWpsPin(Pin)
{
	var	result = true;

	if (Pin.length !=0)
	{
		if (Pin.length != 8)
		{
			result = false;
		}
	}
	else
	{
		result = true;
	}
	
	return (result);
}

function chunkMAC(inString)
{
	var outString = "";
	var lsv;

	for (lcv = 0;
		 lcv < 17;
		 lcv++)
	{
		outString += inString[lcv];
		if ((lcv+1) % 6 == 0)
			outString += "  ";
	}
	return (outString);
}

function truncateSSID(inString, len)
{
	var outString = "";
	
	if (inString.length > len)
	{
		for(lcv = 0;
			lcv < len;
			lcv++)
		{
			outString += inString[lcv];
		}
		outString += "...";
	}
	else
	{
		outString = inString;
	}
	return (outString);
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	var c;
	for(var i=0;i < ca.length;i++) 
	{
		c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

/*
 * JQuery code to automatically insert "(more)..." and "...(less)" around any
 * element belonging to the extendedText class.  The script first checks to make sure
 * that the moreText and lessText classes do not already exist.
 */
	$(document).ready(function(){
		$(".lessText, .extendedText").hide();
		$(".extendedText").each(function(){
			var object;
			object = $(this).next();
			if ( ! ($(this).next().hasClass('lessText') ) )
			{
				$(this).before('<a href="#" class="moreText"> (more)...</a>');
				$(this).after('<a href="#" class="lessText" style="display:none"> ...(less)</a>');
			}
		});
	});

/*
 * These two routines control the display and hiding of more/less text.anchor
 * The text is divided into two sections: the basic text that is always shown and
 * the extended text that is only shown when "more" is selected and hidden when "less"
 * is selected.
 *
 * The text is organized as four spans in a single container (e.g. div or table data) 
 * that hold the basic text, the word "more" with the class "moreText", the extended 
 * text with the class "extendedText", and the word "less" with the class "lessText".
 */
	$('.moreText').live('click', function(){
//		alert("Class moreText was Clicked");
		$(this).hide();
		$(this).next().show();
		$(this).next().next().show();
		return false;
	});

	$('.lessText').live('click', function(){
//		alert("Class lessText was Clicked");
		$(this).prev().prev().show();
		$(this).prev().hide();
		$(this).hide();
		return false;
	});
	

	/*
 * JQuery code to manage tool tips.
 */
	$(document).ready(function(){
		$(".bttRegion").mouseenter(function(){
			if (! $(this).hasClass("bttBuilt") )
			{
				$(this).find(".bttMiddle").before('<span class="bttTop"></span>');
				$(this).find(".bttMiddle").after('<span class="bttBottom"></span>');
				$(this).addClass("bttBuilt");
			}
			$(this).find(".bttPopup").show();
		});
		
		$(".bttRegion").mouseleave(function(){
			$(this).find(".bttPopup").hide();
		});
	});
	
$(document).ready(function(){
	buildMenus();
	buildSiteMap();
});


var timeout         = 250;
var closetimer		= 0;
var	topLevelActive	= false;
var ddmenuitem      = 0;
var	text;

function bindMenus(){

	$("li.mainMenu").mouseleave( function(){			// Hides Submenu after timeout when the  
    	closetimer = window.setTimeout(mclose, timeout);	// mouse is no longer over Main Menu Item 
		$(this).removeClass("activeMenu");
		topLevelActive = false;
	});

	$("li.subMenu").mouseleave(function(){	// Hides Submenu after timeout when the 
		closetimer = window.setTimeout(mclose, timeout);	// mouse is no longer over Sub Menu Item 
	});

	$("li.subMenu").mouseenter(function(){	// Keeps Sub Menu visable when mouse over sub menu
		mcancelclosetime(); 
	});
	
	$("li.mainMenu").mouseenter(function(){	// Displays Submenu when mouse over Main Menu item
		mcancelclosetime();  // cancel close timer
		$(".subMenu").hide();  // close old layer
		$(this).find(".subMenu").show();
		topLevelActive = true;
		mcancelclosetime();  // cancel close timer
	});

	function mcancelclosetime()
	{
		if(closetimer)
		{
			window.clearTimeout(closetimer);
			closetimer = null;
		}
	}
	mclose();
}

// close showed layer
function mclose()
{
	if (!topLevelActive) $(".subMenu").hide();  // close old layer
}
	
// close layer when click-out
document.onclick = mclose; 


function numActiveMenus(menuItem)
{
	var	result = 0;
	for (var i = 0;
		 i < menuItem.length;
		 i++)
	{
		if ( topMenuActive(menuItem[i]) )
		{
			result++
		}
	}
	if ( configuratorActive() ) result++;
	return (result);
}


function buildSiteMap()
{
	var htmlOutput="";

	htmlOutput += '<ul id="uberSiteMap" class="mainMenuB">';

	for (var i = 0;
		 i < menuItem.length;
		 i++)
	{
		if (topMenuActive(menuItem[i]) || menuItem[i].subMenu[0].name == "null")
		{

//			alert ("Build Site map - Top Menu "+menuItem[i].name);

			htmlOutput += '<li class="mainMenuB mainMenuItems_';
			htmlOutput += numActiveMenus(menuItem);

			if (i != menuItem.length - 1)
			{
				htmlOutput += '">';
			}
			else
			{
				htmlOutput += ' mainMenuLast">';
			}

			if (menuItem[i].subMenu[0].name == "null")
			{
				htmlOutput += "<a href=" + menuItem[i].subMenu[0].linkUrl + ">" + menuItem[i].name+'</a>';
			}
			else
			{
				htmlOutput += menuItem[i].name;
			}

			if (menuItem[i].subMenu[0].name != "null")
			{
				htmlOutput += '<ul class="subMenuB">'
			}
			
			for (var lcv = 0;
				 lcv < menuItem[i].subMenu.length;
				 lcv++)
			{
				if (subMenuActive(menuItem[i].subMenu[lcv]) && 
					menuItem[i].subMenu[lcv].name != "null")
				{
					htmlOutput += '<li class="subMenuB"><a href="';
					htmlOutput += menuItem[i].subMenu[lcv].linkUrl;
					htmlOutput += '">'
					htmlOutput += menuItem[i].subMenu[lcv].name;
					htmlOutput += '</a></li>';
				}
			}
			if (menuItem[i].subMenu[0].name == "null")
			{
				htmlOutput += '</li>';
			}
			else
			{
			htmlOutput += '</ul></li>';
		    }
	    }
	}
	htmlOutput += '</ul>';
	$("#siteMapBottom").html(htmlOutput);

}

<!-- controls help sections in tables as well as displaying table rows -->
		$(document).ready(function(){
			$(".helpDetail").hide();
			$('.helpClick').css('border-collapse', 'collapse');
//			$(".helpDetail").addClass('simpleTable tr.even');

			$(".helpClick").click(function(){
				$(this).parent().parent().next().toggle();
				$(this).parent().find(".helpClick").toggleClass("up");
			});
		});

function buildMenus()
{
	var htmlOutput="";

	htmlOutput += '<ul id="uberAwesomeMenu" class="mainMenu">';

	for (var i = 0;
		 i < menuItem.length;
		 i++)
	{
		if (topMenuActive(menuItem[i]) )
		{

			htmlOutput += '<li class="mainMenu mainMenuItems_';
			htmlOutput += numActiveMenus(menuItem);

			if ( (i != menuItem.length - 1) || configuratorActive() )
			{
				htmlOutput += ' menuClickable">';
			}
			else
			{
				htmlOutput += ' menuClickable mainMenuLast">';
			}
			
			
			if ( menuItem[i].subMenu[0].name == "null")
			{
				htmlOutput += '<a href="'+ menuTopLink(menuItem[i]) + '">' + menuItem[i].name+'</a>';
			}
			else
			{
				htmlOutput += menuItem[i].name;
				htmlOutput += '<ul class="subMenu" style="display:none">';

				for (var lcv in menuItem[i].subMenu)
				{
					if (subMenuActive(menuItem[i].subMenu[lcv]) && 
						menuItem[i].subMenu[lcv].name != "null")
					{
						htmlOutput += '<li class="subMenu menuClickable"><a href="';
						htmlOutput += menuItem[i].subMenu[lcv].linkUrl;
						htmlOutput += '">'
						htmlOutput += menuItem[i].subMenu[lcv].name;
						htmlOutput += '</a></li>';
					}
				}
				
				htmlOutput += '</ul></li>';
			}
		}
	}

	if ( configuratorActive() )
	{
			htmlOutput += '<li class="mainMenu mainMenuItems_';
			htmlOutput += numActiveMenus(menuItem);
			htmlOutput += ' menuClickable mainMenuLast">';
			htmlOutput += '<a href="configurator.asp">CONFIGURATOR</a></li>';
	}

	htmlOutput += '</ul>';

	$("#topMenu").html(htmlOutput);

	bindMenus();
}

function topMenuActive(topMenu)
{
	var	result = false;
	var lcv;
	
	for (lcv in topMenu.subMenu)
	{
		if ( subMenuActive(topMenu.subMenu[lcv]) )
		{
			result = true;
		}
	}
	return (result);
}

function subMenuActive(subMenu)
{
	var	lcv;
	var	hideMenuArray;
	var	menuID;
	var	result = true;

	hideMenuArray = hiddenMenuList.split(",");

	for (var lcv in hideMenuArray)
	{
		if (subMenu.name != "null")
		{
			menuID = parseInt(hideMenuArray[lcv], 16);
			menuID = menuID.toString(16);
			if ( ("menu"+menuID ) == subMenu.menuID )
			{
				result = false;
			}
		}
	}
	return (result);
}

function configuratorActive()
{
	var	lcv;
	var	hideMenuArray;
	var	menuID;
	var	result = false;

	hideMenuArray = hiddenMenuList.split(",");

	for (var lcv in hideMenuArray)
	{
		if ( hideMenuArray[lcv] == " 0xffff")
		{
			result = true;
		}
	}
	return (result);
}

function menuTopLink(menu)
{
	result = "";
	
	for (var lcv = 0;
		 result != "null" && lcv < menu.subMenu.length;
		 lcv++)
	{
		if (subMenuActive(menu.subMenu[lcv]) )
		{
			result = menu.subMenu[lcv].linkUrl;
		}
	}
	return (result);
}




