// TypeScript test file to validate type definitions
// This file is not meant to be executed, but to be type-checked by TypeScript compiler

import * as libxslt from '../index';
import { Stylesheet, ApplyOptions } from '../index';

// Test that libxmljs2 is properly exported
const xmlDoc = libxslt.libxmljs.parseXml('<root>test</root>');

// Test synchronous parse from string
const stylesheet1: Stylesheet = libxslt.parse('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"></xsl:stylesheet>');

// Test synchronous parse from Document
const stylesheetDoc = libxslt.libxmljs.parseXml('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"></xsl:stylesheet>');
const stylesheet2: Stylesheet = libxslt.parse(stylesheetDoc);

// Test asynchronous parse with callback
libxslt.parse('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"></xsl:stylesheet>', (err, stylesheet) => {
    if (err) {
        console.error(err);
        return;
    }
    if (stylesheet) {
        // stylesheet is properly typed as Stylesheet
        console.log('Parsed stylesheet successfully');
    }
});

// Test parseFile
libxslt.parseFile('./test/resources/cd.xsl', (err, stylesheet) => {
    if (err) {
        console.error(err);
        return;
    }
    if (stylesheet) {
        console.log('Parsed stylesheet from file');
    }
});

// Test synchronous apply methods
const xmlString = '<test>data</test>';
const resultString: string = stylesheet1.apply(xmlString);
const resultDoc: libxslt.libxmljs.Document = stylesheet1.apply(xmlDoc);

// Test apply with parameters
const params = { param1: 'value1' };
const resultWithParams: string = stylesheet1.apply(xmlString, params);

// Test apply with options
const options: ApplyOptions = {
    outputFormat: 'string',
    noWrapParams: false
};
const resultWithOptions: string | libxslt.libxmljs.Document = stylesheet1.apply(xmlString, params, options);

// Test asynchronous apply methods
stylesheet1.apply(xmlString, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    // result should be string since input was string
    if (typeof result === 'string') {
        console.log('Apply result:', result);
    }
});

stylesheet1.apply(xmlDoc, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    // result should be Document since input was Document
    if (result && typeof result === 'object' && 'root' in result) {
        console.log('Apply result is Document');
    }
});

// Test apply with parameters and callback
stylesheet1.apply(xmlString, params, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    if (typeof result === 'string') {
        console.log('Apply with params result:', result);
    }
});

// Test apply with all options and callback
stylesheet1.apply(xmlString, params, options, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Apply with all options result:', result);
});

// Test applyToFile
stylesheet1.applyToFile('./test/resources/cd.xml', (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    if (typeof result === 'string') {
        console.log('ApplyToFile result:', result);
    }
});

// Test applyToFile with parameters
stylesheet1.applyToFile('./test/resources/cd.xml', params, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    if (typeof result === 'string') {
        console.log('ApplyToFile with params result:', result);
    }
});

// Test applyToFile with all options
stylesheet1.applyToFile('./test/resources/cd.xml', params, options, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    if (typeof result === 'string') {
        console.log('ApplyToFile with all options result:', result);
    }
});

console.log('All TypeScript type checks passed!');