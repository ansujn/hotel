package consent

import (
	"bytes"
	"fmt"
	"time"

	"github.com/go-pdf/fpdf"
)

// ConsentPDFInput is the payload used to render the one-page PDF.
type ConsentPDFInput struct {
	AssetID    string
	AssetTitle string
	ParentName string
	Scope      Scope
	ValidUntil time.Time
	IP         string
	SignedAt   time.Time
}

// RenderConsentPDF produces the one-page publishing consent document.
func RenderConsentPDF(in ConsentPDFInput) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AddPage()

	pdf.SetFont("Helvetica", "B", 16)
	pdf.Cell(0, 10, "Publishing Consent -- Vik Theatre")
	pdf.Ln(14)

	pdf.SetFont("Helvetica", "", 11)
	pdf.MultiCell(0, 6, "I, the undersigned parent/guardian, authorise Vik Theatre to publish the following recording according to the scope selected below.", "", "", false)
	pdf.Ln(4)

	row := func(k, v string) {
		pdf.SetFont("Helvetica", "B", 11)
		pdf.CellFormat(40, 7, k, "", 0, "", false, 0, "")
		pdf.SetFont("Helvetica", "", 11)
		pdf.CellFormat(0, 7, v, "", 1, "", false, 0, "")
	}

	row("Asset ID:", in.AssetID)
	if in.AssetTitle != "" {
		row("Title:", in.AssetTitle)
	}
	row("Parent:", in.ParentName)
	row("Signed at:", in.SignedAt.Format(time.RFC3339))
	row("IP:", in.IP)
	row("Valid until:", in.ValidUntil.Format("2006-01-02"))

	pdf.Ln(4)
	pdf.SetFont("Helvetica", "B", 12)
	pdf.Cell(0, 8, "Scope")
	pdf.Ln(8)
	pdf.SetFont("Helvetica", "", 11)
	pdf.Cell(0, 6, fmt.Sprintf("[%s] Student channel (public page)", check(in.Scope.Channel)))
	pdf.Ln(6)
	pdf.Cell(0, 6, fmt.Sprintf("[%s] Social media reposts", check(in.Scope.Social)))
	pdf.Ln(6)
	pdf.Cell(0, 6, fmt.Sprintf("[%s] Print materials", check(in.Scope.Print)))
	pdf.Ln(14)

	pdf.SetFont("Helvetica", "I", 10)
	pdf.MultiCell(0, 5, "This consent may be revoked in writing at any time. Revocation removes the asset from public surfaces but does not delete archival copies.", "", "", false)

	pdf.Ln(10)
	pdf.SetFont("Helvetica", "", 11)
	pdf.Cell(0, 6, "Signature: "+in.ParentName)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func check(b bool) string {
	if b {
		return "x"
	}
	return " "
}
